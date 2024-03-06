import { gql } from '@apollo/client';

export const CHECKOUT = gql`
  mutation Checkout($recurringInterval: String!, $successUrlPath: String) {
    checkout(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
    ) {
      url
    }
  }
`;
