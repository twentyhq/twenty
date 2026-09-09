import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW = gql`
  query GetCoreWorkflow($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      updatedAt
    }
  }
`;
