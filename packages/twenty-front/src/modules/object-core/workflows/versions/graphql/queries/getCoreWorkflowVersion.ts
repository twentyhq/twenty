import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSION = gql`
  query GetCoreWorkflowVersion($workspaceWorkflowVersionId: UUID!) {
    coreWorkflowVersion(
      workspaceWorkflowVersionId: $workspaceWorkflowVersionId
    ) {
      id
      label
      status
      workspaceWorkflowVersionId
      workspaceWorkflowId
      trigger
      steps
      createdAt
    }
  }
`;
