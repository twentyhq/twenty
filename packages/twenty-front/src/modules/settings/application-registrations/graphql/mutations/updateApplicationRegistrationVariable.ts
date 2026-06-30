import { gql } from '@apollo/client';

export const UPDATE_APPLICATION_REGISTRATION_VARIABLE = gql`
  mutation UpdateApplicationRegistrationVariable(
    $input: UpdateApplicationRegistrationVariableInput!
  ) {
    updateApplicationRegistrationVariable(input: $input) {
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
