import { gql } from '@apollo/client';

export const ROTATE_APPLICATION_REGISTRATION_CLIENT_SECRET = gql`
  mutation RotateApplicationRegistrationClientSecret($id: String!) {
    rotateApplicationRegistrationClientSecret(id: $id) {
      clientSecret
    }
  }
`;
