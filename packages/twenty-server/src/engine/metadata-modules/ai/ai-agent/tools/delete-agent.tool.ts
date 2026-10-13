import { z } from 'zod';

import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import { findManageableAgentOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/find-manageable-agent-or-throw.util';

const deleteAgentSchema = z.object({
  id: z.uuid().describe('Id of the agent to delete'),
});

type DeleteAgentParams = z.infer<typeof deleteAgentSchema>;

export const createDeleteAgentTool = (
  deps: Pick<AgentToolDependencies, 'agentService'>,
  context: AgentToolContext,
) => ({
  name: 'delete_agent' as const,
  description: `Delete an AI agent and its triggers, for example once it is no longer useful. Use list_agents first if you don't know the id.`,
  inputSchema: deleteAgentSchema,
  execute: async (parameters: DeleteAgentParams) => {
    await findManageableAgentOrThrow({
      agentId: parameters.id,
      deps,
      context,
    });

    const agent = await deps.agentService.deleteOneAgent(
      parameters.id,
      context.workspaceId,
    );

    return {
      success: true,
      message: `Agent "${agent.label}" deleted`,
      result: { id: agent.id, label: agent.label },
    };
  },
});
