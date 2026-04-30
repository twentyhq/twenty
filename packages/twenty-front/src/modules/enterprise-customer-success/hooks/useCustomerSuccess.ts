import { gql } from '@apollo/client';

export const GET_CUSTOMER-SUCCESS_DATA = gql`
  query GetCustomerSuccessData {
    customersuccessData {
      id
    }
  }
`;

export const CREATE_CUSTOMER-SUCCESS_ITEM = gql`
  mutation CreateCustomerSuccessItem($input: CustomerSuccessInput!) {
    createCustomerSuccessItem(input: $input) {
      id
    }
  }
`;

export const GET_CUSTOMER-SUCCESS_ANALYTICS = gql`
  query GetCustomerSuccessAnalytics {
    customersuccessAnalytics {
      totalCount
      activeCount
    }
  }
`;
