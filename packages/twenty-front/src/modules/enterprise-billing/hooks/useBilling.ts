import { gql } from '@apollo/client';

export const GET_BILLING_DATA = gql`
  query GetBillingData {
    billingData {
      id
    }
  }
`;

export const CREATE_BILLING_ITEM = gql`
  mutation CreateBillingItem($input: BillingInput!) {
    createBillingItem(input: $input) {
      id
    }
  }
`;

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics {
    billingAnalytics {
      totalCount
      activeCount
    }
  }
`;
