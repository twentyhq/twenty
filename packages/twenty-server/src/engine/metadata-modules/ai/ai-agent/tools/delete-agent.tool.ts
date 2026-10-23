import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { findManageableAgentOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/find-manageable-agent-or-throw.util';

const deleteAgentInputSchema = z.object({
  id: z.uuid().describe('Id of the agent to delete'),
});

@DefineTool({
  name: 'delete_agent',
  category: ToolCategory.AGENT,
  requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  description: `Delete an AI agent and its triggers, for example once it is no longer useful. Use list_agents first if you don't know the id.`,
})
export class DeleteAgentTool extends BaseTool<typeof deleteAgentInputSchema> {
  readonly inputSchema = deleteAgentInputSchema;

  constructor(private readonly agentService: AgentService) {
    super();
  }

  async execute({
    input,
    context,
  }: ToolExecuteArgs<typeof deleteAgentInputSchema>): Promise<ToolOutput> {
    await findManageableAgentOrThrow({
      agentId: input.id,
      agentService: this.agentService,
      context,
    });

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
