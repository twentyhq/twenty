import { gql } from '@apollo/client';

export const GET_AGENT_RUN_SUMMARIES = gql`
  query GetAgentRunSummaries {
    agentRunSummaries {
      agentId
      runCountLast14Days
      recentRuns {
        id
        status
        createdAt
      }
    }
  }
`;
