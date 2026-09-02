import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSIONS = gql`
  query GetCoreWorkflowVersions($workflowId: UUID!) {
    coreWorkflowVersions(workflowId: $workflowId) {
      id
      label
      status
      workspaceWorkflowVersionId
      createdAt
    }
  }
`;
