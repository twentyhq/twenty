import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($data: WorkspaceUpdateInput!) {
    updateWorkspace(data: $data) {
      id
      domainName
      displayName
      logo
    }
  }
`;
