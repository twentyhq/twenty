import { gql } from '@apollo/client';

export const FIND_PENDING_APPLICATION_REGISTRATION_CLAIMS = gql`
  query FindPendingApplicationRegistrationClaims {
    findPendingApplicationRegistrationClaims {
      applicationRegistrationId
      universalIdentifier
      name
      logoUrl
      description
      sourcePackage
      token
      expiresAt
    }
  }
`;
