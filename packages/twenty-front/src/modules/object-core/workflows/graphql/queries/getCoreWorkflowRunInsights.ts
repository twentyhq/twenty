import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_RUN_INSIGHTS = gql`
  query GetCoreWorkflowRunInsights($coreWorkflowId: UUID!, $timeZone: String!) {
    coreWorkflowRunInsights(
      coreWorkflowId: $coreWorkflowId
      timeZone: $timeZone
    ) {
      coreWorkflowId
      runCount
      failedRunCount
      isRunCountLowerBound
      averageDurationInMs
      dailyRunCounts {
        day
        completedRunCount
        failedRunCount
        otherRunCount
      }
      recentFailedRuns {
        id
        name
        createdAt
        errorMessage
      }
    }
  }
`;
