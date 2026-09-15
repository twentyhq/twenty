import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS_WITH_CURRENT_VERSION = gql`
  query GetCoreWorkflowsWithCurrentVersion($coreWorkflowIds: [UUID!]!) {
    coreWorkflowsWithCurrentVersion(coreWorkflowIds: $coreWorkflowIds) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      currentVersion {
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
  }
`;
