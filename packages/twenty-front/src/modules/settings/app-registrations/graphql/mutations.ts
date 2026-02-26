import { gql } from '@apollo/client';

import { APP_REGISTRATION_FRAGMENT } from '@/settings/app-registrations/graphql/queries';

export const UPDATE_APP_REGISTRATION = gql`
  mutation UpdateAppRegistration($input: UpdateAppRegistrationInput!) {
    updateAppRegistration(input: $input) {
      ...AppRegistrationFragment
    }
  }
  ${APP_REGISTRATION_FRAGMENT}
`;

export const DELETE_APP_REGISTRATION = gql`
  mutation DeleteAppRegistration($id: String!) {
    deleteAppRegistration(id: $id)
  }
`;

export const ROTATE_APP_REGISTRATION_CLIENT_SECRET = gql`
  mutation RotateAppRegistrationClientSecret($id: String!) {
    rotateAppRegistrationClientSecret(id: $id) {
      clientSecret
    }
  }
`;

export const UPDATE_APP_REGISTRATION_VARIABLE = gql`
  mutation UpdateAppRegistrationVariable(
    $input: UpdateAppRegistrationVariableInput!
  ) {
    updateAppRegistrationVariable(input: $input) {
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

