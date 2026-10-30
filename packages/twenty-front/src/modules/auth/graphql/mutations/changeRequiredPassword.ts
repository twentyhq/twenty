import { gql } from '@apollo/client';

export const CHANGE_REQUIRED_PASSWORD = gql`
  mutation ChangeRequiredPassword($newPassword: String!) {
    changeRequiredPassword(newPassword: $newPassword) {
      success
    }
  }
`;
