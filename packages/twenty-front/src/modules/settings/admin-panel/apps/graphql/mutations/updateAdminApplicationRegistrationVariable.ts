import { gql } from '@apollo/client';

export const UPDATE_ADMIN_APPLICATION_REGISTRATION_VARIABLE = gql`
  mutation UpdateAdminApplicationRegistrationVariable(
    $input: UpdateApplicationRegistrationVariableInput!
  ) {
    updateAdminApplicationRegistrationVariable(input: $input) {
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
