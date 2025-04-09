import { gql } from '@apollo/client';

export const GET_ALL_INTER_INTEGRATIONS = gql`
  query InterIntegrationsByWorkspace($workspaceId: String!) {
    interIntegrationsByWorkspace(workspaceId: $workspaceId) {
      id
      integrationName
      clientId
      clientSecret
      privateKey
      certificate
      status
      workspace {
        id
      }
    }
  }
`;
