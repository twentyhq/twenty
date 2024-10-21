import { gql } from '@apollo/client';

export const ADD_USER_TO_WORKSPACE_BY_INVITE_TOKEN = gql`
  mutation AddUserToWorkspaceByInviteToken($inviteToken: String!) {
    addUserToWorkspaceByInviteToken(inviteToken: $inviteToken) {
      id
    }
  }
`;
