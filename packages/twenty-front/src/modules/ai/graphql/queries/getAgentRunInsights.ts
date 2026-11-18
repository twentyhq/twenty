import { gql } from '@apollo/client';

export const GET_AGENT_RUN_INSIGHTS = gql`
  query GetAgentRunInsights($agentId: UUID!, $timeZone: String!) {
    agentRunInsights(agentId: $agentId, timeZone: $timeZone) {
      agentId
      runCount
      tokenCount
      credits
      averageDurationInMs
      dailyRunCounts {
        day
        completedRunCount
        failedRunCount
        otherRunCount
        credits
      }
    }
  }
`;
