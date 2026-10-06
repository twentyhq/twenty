import { gql } from '@apollo/client';

export const GET_AGENT_RUNS = gql`
  query GetAgentRuns($agentId: UUID!) {
    agentRuns(agentId: $agentId) {
      id
      threadId
      threadTitle
      status
      errorMessage
      createdAt
      startedAt
      endedAt
      modelId
      inputTokens
      outputTokens
      credits
      creatorSource
      creatorName
      input
      reply
      toolNames
    }
  }
`;
