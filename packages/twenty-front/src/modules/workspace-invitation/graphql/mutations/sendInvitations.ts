import { gql } from '@apollo/client';

export const SEND_INVITATIONS = gql`
  mutation SendInvitations($emails: [String!]!, $roleId: String!) {
    sendInvitations(emails: $emails, roleId: $roleId) {
      success
      errors
      result {
        ... on WorkspaceInvitation {
          id
          email
          expiresAt
        }
      }
    }
  }
`;
