import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  ToolCategory,
} from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { agentTriggersSchema } from 'src/engine/metadata-modules/ai/ai-agent/tools/schemas/agent-trigger.schema';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';
import { toAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-triggers.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const createAgentInputSchema = z.object({
  label: z.string().min(1).describe('Display name of the agent'),
  prompt: z
    .string()
    .min(1)
    .describe(
      'System prompt describing who the agent is and what it does on every run',
    ),
  description: z.string().optional().describe('Optional short description'),
  icon: z
    .string()
    .optional()
    .describe('Optional icon identifier (e.g. "IconRobot")'),
  modelId: z
    .string()
    .optional()
    .describe(
      `Model the agent runs on. Defaults to "${AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID}", the workspace default model.`,
    ),
  roleId: z
    .uuid()
    .optional()
    .describe(
      'Role the agent acts with. Without a role the agent can neither read nor write any record.',
    ),
  triggers: agentTriggersSchema.optional(),
});

@DefineTool({
  name: 'create_agent',
  category: ToolCategory.AGENT,
  requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  description: `Create an AI agent that works on its own: it wakes up on its triggers (record events or a schedule) and acts with the tools its role allows, for example posting a note, updating records or sending a summary.

Before creating it, present the plan to the user (prompt, role, triggers) and get their confirmation, since the agent keeps running after this conversation.
Give the agent a role with the least access it needs (use list_roles to find one); without a role it cannot read or write records.
Write the prompt as standing instructions for every run, and put what to do for a specific trigger in that trigger's instructions.`,
})
export class CreateAgentTool extends BaseTool<typeof createAgentInputSchema> {
  readonly inputSchema = createAgentInputSchema;

  constructor(
    private readonly agentService: AgentService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {
    super();
  }

  async execute({
    input: { triggers, ...parameters },
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createAgentInputSchema>): Promise<ToolOutput> {
    const modelId =
      parameters.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;

    this.aiModelRegistryService.validateModelAvailability(modelId);

    const agent = await this.agentService.createOneAgent(
      {
        ...parameters,
        modelId,
        triggers: toAgentTriggers(triggers ?? []),
      },
      workspaceId,
    );

    return {
      success: true,
      message: `Agent "${agent.label}" created`,
      result: toAgentSummary(agent),
    };
  }
}
