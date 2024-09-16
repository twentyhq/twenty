import { gql } from '@apollo/client';

export const SEND_INVITATIONS = gql`
  mutation SendInvitations($emails: [String!]!) {
    sendInvitations(emails: $emails) {
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
