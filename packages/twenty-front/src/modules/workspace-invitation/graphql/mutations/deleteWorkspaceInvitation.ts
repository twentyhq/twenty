import { gql } from '@apollo/client';

export const DELETE_WORKSPACE_INVITATION = gql`
  mutation DeleteWorkspaceInvitation($appTokenId: String!) {
    deleteWorkspaceInvitation(appTokenId: $appTokenId)
  }
`;
