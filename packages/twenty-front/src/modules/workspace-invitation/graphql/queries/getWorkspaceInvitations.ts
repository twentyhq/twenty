import { gql } from '@apollo/client';

export const GET_WORKSPACE_INVITATIONS = gql`
  query GetWorkspaceInvitations {
    findWorkspaceInvitations {
      id
      email
      expiresAt
    }
  }
`;
