import { gql } from '@apollo/client';

export const CLAIM_APPLICATION_REGISTRATION_OWNERSHIP = gql`
  mutation ClaimApplicationRegistrationOwnership(
    $applicationRegistrationId: String!
  ) {
    claimApplicationRegistrationOwnership(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      id
      name
    }
  }
`;
