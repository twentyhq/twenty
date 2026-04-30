import { gql } from '@apollo/client';

export const GET_REVENUE-WATERFALL_DATA = gql`
  query GetRevenueWaterfallData {
    revenuewaterfallData {
      id
    }
  }
`;

export const CREATE_REVENUE-WATERFALL_ITEM = gql`
  mutation CreateRevenueWaterfallItem($input: RevenueWaterfallInput!) {
    createRevenueWaterfallItem(input: $input) {
      id
    }
  }
`;

export const GET_REVENUE-WATERFALL_ANALYTICS = gql`
  query GetRevenueWaterfallAnalytics {
    revenuewaterfallAnalytics {
      totalCount
      activeCount
    }
  }
`;
