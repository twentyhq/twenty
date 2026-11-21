import { gql } from '@apollo/client';

export const GET_WORKSPACE_INVITATION_LINK = gql`
  query GetWorkspaceInvitationLink($appTokenId: String!) {
    getWorkspaceInvitationLink(appTokenId: $appTokenId)
  }
`;
