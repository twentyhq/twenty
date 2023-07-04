import { gql } from '@apollo/client';

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($data: WorkspaceCreateInput!) {
    createWorkspace(data: $data) {
      id
      domainName
      displayName
      logo
    }
  }
`;
