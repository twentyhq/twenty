import { type AgentRunState } from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const AGENT_RUN_QUERY = `
  query AgentRun($id: UUID!) {
    agentRun(id: $id) {
      id
      threadId
      status
      result
      error
    }
  }
`;

export const getAgentRun = async (runId: string): Promise<AgentRunState> => {
  const { agentRun } = await postGraphqlRequest<
    { id: string },
    { agentRun: AgentRunState }
  >({
    query: AGENT_RUN_QUERY,
    variables: { id: runId },
    caller: 'getAgentRun',
  });

  return agentRun;
};
