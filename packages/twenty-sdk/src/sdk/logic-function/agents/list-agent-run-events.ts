import { type AgentRunEvent } from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const AGENT_RUN_EVENTS_QUERY = `
  query AgentRunEvents($agentUniversalIdentifier: UUID!, $threadKey: String!) {
    agentRunEvents(
      agentUniversalIdentifier: $agentUniversalIdentifier
      threadKey: $threadKey
    ) {
      threadId
      events
    }
  }
`;

export type AgentRunThreadReference = {
  agentUniversalIdentifier: string;
  threadKey: string;
};

export type AgentRunEvents = {
  threadId: string;
  events: AgentRunEvent[];
};

export const listAgentRunEvents = async (
  variables: AgentRunThreadReference,
): Promise<AgentRunEvents> => {
  const { agentRunEvents } = await postGraphqlRequest<
    AgentRunThreadReference,
    { agentRunEvents: AgentRunEvents }
  >({
    query: AGENT_RUN_EVENTS_QUERY,
    variables,
    caller: 'listAgentRunEvents',
  });

  return agentRunEvents;
};
