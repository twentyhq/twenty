import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS_WITH_VERSIONS = gql`
  query GetCoreWorkflowsWithVersions($workspaceWorkflowIds: [UUID!]!) {
    coreWorkflowsWithVersions(workspaceWorkflowIds: $workspaceWorkflowIds) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      versions {
        id
        label
        status
        workspaceWorkflowVersionId
        workspaceWorkflowId
        createdAt
        updatedAt
      }
    }
  }
`;
