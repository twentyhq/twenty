import { gql } from '@apollo/client';

export const GET_WORKFLOW_VERSION_CONTENT = gql`
  query GetWorkflowVersionContent($workflowVersionId: UUID!) {
    workflowVersionContent(workflowVersionId: $workflowVersionId) {
      workflowVersionId
      trigger
      steps
    }
  }
`;
