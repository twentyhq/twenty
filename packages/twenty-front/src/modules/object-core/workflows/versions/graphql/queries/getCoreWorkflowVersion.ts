import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSION = gql`
  query GetCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersion: coreWorkflowVersionById(
      coreWorkflowVersionId: $coreWorkflowVersionId
    ) {
      id
      label
      status
      workspaceWorkflowVersionId
      coreWorkflowId
      trigger
      steps
      createdAt
      updatedAt
    }
  }
`;
