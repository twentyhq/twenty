import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AGENT_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-write-access-policy.constant';
import { ManageableAgentService } from 'src/engine/metadata-modules/ai/ai-agent/tools/services/manageable-agent.service';
import { isAgentBackingWorkflowStep } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/is-agent-backing-workflow-step.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const deleteAgentInputSchema = z.object({
  id: z.uuid().describe('Id of the agent to delete'),
});

@DefineTool({
  name: 'delete_agent',
  category: ToolCategory.AGENT,
  accessPolicy: AGENT_WRITE_ACCESS_POLICY,
  description: `Delete an AI agent and its triggers, for example once it is no longer useful. Use list_agents first if you don't know the id.`,
})
export class DeleteAgentTool extends BaseTool<typeof deleteAgentInputSchema> {
  readonly inputSchema = deleteAgentInputSchema;

  constructor(
    private readonly agentService: AgentService,
    private readonly manageableAgentService: ManageableAgentService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  async execute({
    input,
    context,
  }: ToolExecuteArgs<typeof deleteAgentInputSchema>): Promise<ToolOutput> {
    await this.manageableAgentService.findManageableAgentOrThrow({
      agentId: input.id,
      context,
    });

    const { flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'flatWorkflowVersionMaps',
      ]);

    if (
      isAgentBackingWorkflowStep({
        agentId: input.id,
        flatWorkflowVersions: Object.values(
          flatWorkflowVersionMaps.byUniversalIdentifier,
        ).filter(isDefined),
      })
    ) {
      throw new AiException(
        'Workflow AI steps run this agent: point them at another agent before deleting it',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const agent = await this.agentService.deleteOneAgent(
      input.id,
      context.workspaceId,
    );

    return {
      success: true,
      message: `Agent "${agent.label}" deleted`,
      result: { id: agent.id, label: agent.label },
    };
  }
}
