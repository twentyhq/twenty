import gql from 'graphql-tag';

export const GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE = gql`
  query GetFocusNfeIntegrationsByWorkspace($workspaceId: String!) {
    getFocusNfeIntegrationsByWorkspace(workspaceId: $workspaceId) {
      id
      integrationName
      token
      createdAt
      status
      workspace {
        displayName
      }
    }
  }
`;
