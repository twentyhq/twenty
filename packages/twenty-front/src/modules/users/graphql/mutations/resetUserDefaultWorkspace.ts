import { gql } from '@apollo/client';

export const RESET_USER_DEFAULT_WORKSPACE = gql`
  mutation ResetUserDefaultWorkspace($userId: String!) {
    resetUserDefaultWorkspace(userId: $userId) {
      id
    }
  }
`;
