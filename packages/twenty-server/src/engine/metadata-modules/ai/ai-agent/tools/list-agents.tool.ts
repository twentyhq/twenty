import { z } from 'zod';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import { toAgentSummary } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-summary.util';
import { toAgentToolFailureOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/to-agent-tool-failure-or-throw.util';

const listAgentsSchema = z.object({});

export const createListAgentsTool = (
  deps: Pick<AgentToolDependencies, 'agentService'>,
  context: AgentToolContext,
) => ({
  name: 'list_agents' as const,
  description: `List the AI agents of the workspace with their prompt, model, role and triggers. Agents backing workflow AI steps are not included.`,
  inputSchema: listAgentsSchema,
  execute: async () => {
    try {
      const agents = await deps.agentService.findManyAgents(
        context.workspaceId,
      );

      const listedAgents = agents
        .filter(
          (agent) =>
            !agent.isSystem &&
            canCallerReachApplication({
              callingApplication: context.callingApplication,
              applicationId: agent.applicationId,
            }),
        )
        .map(toAgentSummary);

      return {
        success: true,
        message: `Found ${listedAgents.length} agent(s)`,
        result: { agents: listedAgents, count: listedAgents.length },
      };
    } catch (error) {
      return toAgentToolFailureOrThrow({ error, action: 'list agents' });
    }
  },
});
