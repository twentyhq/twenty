import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_BY_ID = gql`
  query GetCoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      createdAt
      updatedAt
    }
  }
`;
