import { gql } from '@apollo/client';

export const ADD_USER_TO_WORKSPACE = gql`
  mutation AddUserToWorkspace($inviteHash: String!) {
    addUserToWorkspace(inviteHash: $inviteHash) {
      id
    }
  }
`;
