import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_VARIABLES = gql`
  query FindApplicationRegistrationVariables(
    $applicationRegistrationId: String!
  ) {
    findApplicationRegistrationVariables(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      id
      key
      description
      isSecret
      isRequired
      isFilled
      createdAt
      updatedAt
    }
  }
`;
