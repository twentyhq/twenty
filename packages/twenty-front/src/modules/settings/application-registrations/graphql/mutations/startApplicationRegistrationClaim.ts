import { gql } from '@apollo/client';

export const START_APPLICATION_REGISTRATION_CLAIM = gql`
  mutation StartApplicationRegistrationClaim(
    $applicationRegistrationId: String!
  ) {
    startApplicationRegistrationClaim(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      applicationRegistrationId
      sourcePackage
      token
      expiresAt
    }
  }
`;
