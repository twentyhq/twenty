import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { z } from 'zod';

import { agentTriggersSchema } from 'src/engine/metadata-modules/ai/ai-agent/tools/schemas/agent-trigger.schema';
import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';
import { toAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-triggers.util';

const createAgentSchema = z.object({
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

type CreateAgentParams = z.infer<typeof createAgentSchema>;

export const createCreateAgentTool = (
  deps: AgentToolDependencies,
  context: AgentToolContext,
) => ({
  name: 'create_agent' as const,
  description: `Create an AI agent that works on its own: it wakes up on its triggers (record events or a schedule) and acts with the tools its role allows, for example posting a note, updating records or sending a summary.

Before creating it, present the plan to the user (prompt, role, triggers) and get their confirmation, since the agent keeps running after this conversation.
Give the agent a role with the least access it needs (use list_roles to find one); without a role it cannot read or write records.
Write the prompt as standing instructions for every run, and put what to do for a specific trigger in that trigger's instructions.`,
  inputSchema: createAgentSchema,
  execute: async ({ triggers, ...parameters }: CreateAgentParams) => {
    const modelId =
      parameters.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;

    deps.aiModelRegistryService.validateModelAvailability(modelId);

    const agent = await deps.agentService.createOneAgent(
      {
        ...parameters,
        modelId,
        triggers: toAgentTriggers(triggers ?? []),
      },
      context.workspaceId,
    );

    return {
      success: true,
      message: `Agent "${agent.label}" created`,
      result: toAgentSummary(agent),
    };
  },
});
