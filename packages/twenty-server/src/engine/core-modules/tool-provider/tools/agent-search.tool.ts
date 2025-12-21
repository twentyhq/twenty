import { z } from 'zod';

import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

export const AGENT_SEARCH_TOOL_NAME = 'agent_search';

export const agentSearchInputSchema = z.object({
  input: z.object({
    query: z.string().describe('What kind of expertise or help you need'),
    limit: z
      .number()
      .optional()
      .default(2)
      .describe('Maximum number of agents to return'),
  }),
});

export type AgentSearchInput = z.infer<typeof agentSearchInputSchema>['input'];

export type AgentSearchResult = {
  agents: Array<{
    name: string;
    label: string;
    expertise: string;
  }>;
  message: string;
};

export type AgentSearchFunction = (
  query: string,
  options: { limit: number },
) => Promise<AgentEntity[]>;

export const createAgentSearchTool = (searchAgents: AgentSearchFunction) => ({
  description:
    'Search for agent expertise/skills to help with specialized tasks. Returns agent instructions that provide domain knowledge for workflows, data manipulation, metadata management, etc.',
  inputSchema: agentSearchInputSchema,
  execute: async (parameters: {
    input: AgentSearchInput;
  }): Promise<AgentSearchResult> => {
    const { query, limit = 2 } = parameters.input;

    const agents = await searchAgents(query, { limit });

    if (agents.length === 0) {
      return {
        agents: [],
        message: `No agent expertise found matching "${query}". Try searching for: "workflow", "data", "metadata", "dashboard", or "research".`,
      };
    }

    return {
      agents: agents.map((agent) => ({
        name: agent.name,
        label: agent.label,
        expertise: agent.prompt,
      })),
      message: `Found ${agents.length} agent(s) with relevant expertise. Their instructions are included above to help guide your approach.`,
    };
  },
});
