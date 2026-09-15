import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSIONS_BY_IDS = gql`
  query GetCoreWorkflowVersionsByIds($workspaceWorkflowVersionIds: [UUID!]!) {
    coreWorkflowVersionsByIds(
      workspaceWorkflowVersionIds: $workspaceWorkflowVersionIds
    ) {
      id
      label
      status
      workspaceWorkflowVersionId
      workspaceWorkflowId
      trigger
      steps
      createdAt
      updatedAt
    }
  }
`;
