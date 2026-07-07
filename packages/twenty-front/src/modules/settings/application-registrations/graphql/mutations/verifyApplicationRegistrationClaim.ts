import { gql } from '@apollo/client';

export const VERIFY_APPLICATION_REGISTRATION_CLAIM = gql`
  mutation VerifyApplicationRegistrationClaim(
    $applicationRegistrationId: String!
  ) {
    verifyApplicationRegistrationClaim(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      id
      name
    }
  }
`;
