import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSIONS = gql`
  query GetCoreWorkflowVersions($workspaceWorkflowId: UUID!) {
    coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      label
      status
      workspaceWorkflowVersionId
      workspaceWorkflowId
      createdAt
    }
  }
`;
