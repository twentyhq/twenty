import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { agentTriggersSchema } from 'src/engine/metadata-modules/ai/ai-agent/tools/schemas/agent-trigger.schema';
import { findManageableAgentOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/find-manageable-agent-or-throw.util';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';
import { toAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-triggers.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const updateAgentInputSchema = z.object({
  id: z.uuid().describe('Id of the agent to update'),
  label: z.string().min(1).optional(),
  prompt: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  modelId: z.string().optional(),
  roleId: z
    .uuid()
    .nullable()
    .optional()
    .describe('New role of the agent, or null to remove its role'),
  triggers: agentTriggersSchema
    .optional()
    .describe(
      'Replaces the whole trigger list. To keep an existing trigger, pass it again with its id from list_agents. Pass an empty list to remove all triggers.',
    ),
});

@DefineTool({
  name: 'update_agent',
  category: ToolCategory.AGENT,
  requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  description: `Update an AI agent. Only the fields you pass are changed.

To pause an agent without deleting it, set isActive to false on its triggers. Confirm changes to the role or triggers with the user first.`,
})
export class UpdateAgentTool extends BaseTool<typeof updateAgentInputSchema> {
  readonly inputSchema = updateAgentInputSchema;

  constructor(
    private readonly agentService: AgentService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {
    super();
  }

  async execute({
    input: { triggers, ...parameters },
    context,
  }: ToolExecuteArgs<typeof updateAgentInputSchema>): Promise<ToolOutput> {
    await findManageableAgentOrThrow({
      agentId: parameters.id,
      agentService: this.agentService,
      context,
    });

    if (isDefined(parameters.modelId)) {
      this.aiModelRegistryService.validateModelAvailability(parameters.modelId);
    }

    const agent = await this.agentService.updateOneAgent({
      input: {
        ...parameters,
        ...(isDefined(triggers) && { triggers: toAgentTriggers(triggers) }),
      },
      workspaceId: context.workspaceId,
    });

    return {
      success: true,
      message: `Agent "${agent.label}" updated`,
      result: toAgentSummary(agent),
    };
  }
}
