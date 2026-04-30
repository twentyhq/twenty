import { gql } from '@apollo/client';

export const GET_SALES-COACHING_DATA = gql`
  query GetSalesCoachingData {
    salescoachingData {
      id
    }
  }
`;

export const CREATE_SALES-COACHING_ITEM = gql`
  mutation CreateSalesCoachingItem($input: SalesCoachingInput!) {
    createSalesCoachingItem(input: $input) {
      id
    }
  }
`;

export const GET_SALES-COACHING_ANALYTICS = gql`
  query GetSalesCoachingAnalytics {
    salescoachingAnalytics {
      totalCount
      activeCount
    }
  }
`;
