import { gql } from '@apollo/client';

export const SEND_INVITATIONS = gql`
  mutation SendInvitations(
    $emails: [String!]!
    $roleId: UUID
    $isOnboardingInvitation: Boolean
  ) {
    sendInvitations(
      emails: $emails
      roleId: $roleId
      isOnboardingInvitation: $isOnboardingInvitation
    ) {
      success
      errors
      result {
        ... on WorkspaceInvitation {
          id
          email
          roleId
          expiresAt
        }
      }
    }
  }
`;
