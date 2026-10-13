import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { agentTriggersSchema } from 'src/engine/metadata-modules/ai/ai-agent/tools/schemas/agent-trigger.schema';
import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import { findManageableAgentOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/find-manageable-agent-or-throw.util';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';
import { toAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-triggers.util';

const updateAgentSchema = z.object({
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

type UpdateAgentParams = z.infer<typeof updateAgentSchema>;

export const createUpdateAgentTool = (
  deps: AgentToolDependencies,
  context: AgentToolContext,
) => ({
  name: 'update_agent' as const,
  description: `Update an AI agent. Only the fields you pass are changed.

To pause an agent without deleting it, set isActive to false on its triggers. Confirm changes to the role or triggers with the user first.`,
  inputSchema: updateAgentSchema,
  execute: async ({ triggers, ...parameters }: UpdateAgentParams) => {
    await findManageableAgentOrThrow({
      agentId: parameters.id,
      deps,
      context,
    });

    if (isDefined(parameters.modelId)) {
      deps.aiModelRegistryService.validateModelAvailability(parameters.modelId);
    }

    const agent = await deps.agentService.updateOneAgent({
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
  },
});
