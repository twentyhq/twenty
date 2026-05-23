import { gql } from '@apollo/client';

export const UPDATE_CONNECTED_ACCOUNT_SIGNATURE = gql`
  mutation UpdateConnectedAccountSignature(
    $input: UpdateConnectedAccountSignatureInput!
  ) {
    updateConnectedAccountSignature(input: $input) {
      id
      emailSignature
      updatedAt
    }
  }
`;
