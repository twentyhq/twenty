import { gql } from '@apollo/client';

export const GET_SAAS-PLATFORM_DATA = gql`
  query GetSaasPlatformData {
    saasplatformData {
      id
    }
  }
`;

export const CREATE_SAAS-PLATFORM_ITEM = gql`
  mutation CreateSaasPlatformItem($input: SaasPlatformInput!) {
    createSaasPlatformItem(input: $input) {
      id
    }
  }
`;

export const GET_SAAS-PLATFORM_ANALYTICS = gql`
  query GetSaasPlatformAnalytics {
    saasplatformAnalytics {
      totalCount
      activeCount
    }
  }
`;
