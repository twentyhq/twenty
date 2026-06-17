import { gql } from '@apollo/client';

export const UPDATE_SERVER_ADMIN_ACCESS = gql`
  mutation UpdateServerAdminAccess(
    $userId: UUID!
    $canAccessFullAdminPanel: Boolean
    $canImpersonate: Boolean
    $otp: String
  ) {
    updateServerAdminAccess(
      userId: $userId
      canAccessFullAdminPanel: $canAccessFullAdminPanel
      canImpersonate: $canImpersonate
      otp: $otp
    ) {
      id
      email
      firstName
      lastName
      canAccessFullAdminPanel
      canImpersonate
    }
  }
`;
