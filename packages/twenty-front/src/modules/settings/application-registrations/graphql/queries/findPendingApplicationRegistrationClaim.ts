import { gql } from '@apollo/client';

export const FIND_PENDING_APPLICATION_REGISTRATION_CLAIM = gql`
  query FindPendingApplicationRegistrationClaim(
    $applicationRegistrationId: String!
  ) {
    findPendingApplicationRegistrationClaim(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      applicationRegistrationId
      sourcePackage
      token
      expiresAt
    }
  }
`;
