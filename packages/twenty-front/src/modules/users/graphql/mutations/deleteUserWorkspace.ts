import { gql } from '@apollo/client';

export const DELETE_USER_FROM_WORKSPACE = gql`
  mutation DeleteUserWorkspace($workspaceMemberIdToDelete: String!) {
    deleteUserFromWorkspace(
      workspaceMemberIdToDelete: $workspaceMemberIdToDelete
    ) {
      id
    }
  }
`;
