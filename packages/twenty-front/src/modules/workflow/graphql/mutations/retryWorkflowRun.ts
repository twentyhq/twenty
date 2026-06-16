import { gql } from '@apollo/client';

export const RETRY_WORKFLOW_RUN = gql`
  mutation RetryWorkflowRun($workflowRunId: UUID!) {
    retryWorkflowRun(workflowRunId: $workflowRunId) {
      id
      status
      __typename
    }
  }
`;
