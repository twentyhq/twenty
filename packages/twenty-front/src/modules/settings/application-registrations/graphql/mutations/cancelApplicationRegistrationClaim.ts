import { gql } from '@apollo/client';

export const CANCEL_APPLICATION_REGISTRATION_CLAIM = gql`
  mutation CancelApplicationRegistrationClaim(
    $applicationRegistrationId: String!
  ) {
    cancelApplicationRegistrationClaim(
      applicationRegistrationId: $applicationRegistrationId
    )
  }
`;
