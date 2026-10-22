import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';

const listAgentsInputSchema = z.object({});

@DefineTool({
  name: 'list_agents',
  category: ToolCategory.AGENT,
  requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  description: `List the AI agents of the workspace with their prompt, model, role and triggers. System agents (those backing workflow AI steps or installed by an application) are not included.`,
})
export class ListAgentsTool extends BaseTool<typeof listAgentsInputSchema> {
  readonly inputSchema = listAgentsInputSchema;

  constructor(private readonly agentService: AgentService) {
    super();
  }

  async execute({
    context: { workspaceId, application },
  }: ToolExecuteArgs<typeof listAgentsInputSchema>): Promise<ToolOutput> {
    const agents = await this.agentService.findManyAgents(workspaceId);

    const listedAgents = agents
      .filter(
        (agent) =>
          !agent.isSystem &&
          canCallerReachApplication({
            callingApplication: application,
            applicationId: agent.applicationId,
          }),
      )
      .map(toAgentSummary);

    return {
      success: true,
      message: `Found ${listedAgents.length} agent(s)`,
      result: { agents: listedAgents, count: listedAgents.length },
    };
  }
}
