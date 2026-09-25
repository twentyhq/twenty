import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW = gql`
  query GetCoreWorkflow($coreWorkflowId: UUID!) {
    coreWorkflow: coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      statuses
      lastPublishedCoreWorkflowVersionId
      applicationId
      workspaceWorkflowId
      visibility
      canChangeVisibility
      createdAt
      updatedAt
    }
  }
`;
