import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_VARIABLES = gql`
  query FindAdminApplicationRegistrationVariables(
    $applicationRegistrationId: String!
  ) {
    findAdminApplicationRegistrationVariables(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      id
      key
      value
      description
      isSecret
      isRequired
      isFilled
      createdAt
      updatedAt
    }
  }
`;
