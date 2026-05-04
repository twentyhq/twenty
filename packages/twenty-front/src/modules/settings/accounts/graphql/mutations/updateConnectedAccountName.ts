import { gql } from '@apollo/client';

export const UPDATE_CONNECTED_ACCOUNT_NAME = gql`
  mutation UpdateConnectedAccountName(
    $input: UpdateConnectedAccountNameInput!
  ) {
    updateConnectedAccountName(input: $input) {
      id
      name
      updatedAt
    }
  }
`;
