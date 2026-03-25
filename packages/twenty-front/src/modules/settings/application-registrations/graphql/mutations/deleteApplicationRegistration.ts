import { gql } from '@apollo/client';

export const DELETE_APPLICATION_REGISTRATION = gql`
  mutation DeleteApplicationRegistration($id: String!) {
    deleteApplicationRegistration(id: $id)
  }
`;
