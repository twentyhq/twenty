import { gql } from '@apollo/client';

export const GET_PUBLIC_WORKSPACE_DATA_BY_ID = gql`
  query GetPublicWorkspaceDataById($id: UUID!) {
    getPublicWorkspaceDataById(id: $id) {
      id
      displayName
      logo
    }
  }
`;
