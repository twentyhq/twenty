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
      value
      description
      isSecret
      isRequired
      isDeprecated
      isFilled
      type
      options
      createdAt
      updatedAt
    }
  }
`;
