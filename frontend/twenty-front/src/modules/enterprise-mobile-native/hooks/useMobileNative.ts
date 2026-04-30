import { gql } from '@apollo/client';

export const GET_MOBILE-NATIVE_DATA = gql`
  query GetMobileNativeData {
    mobilenativeData {
      id
    }
  }
`;

export const CREATE_MOBILE-NATIVE_ITEM = gql`
  mutation CreateMobileNativeItem($input: MobileNativeInput!) {
    createMobileNativeItem(input: $input) {
      id
    }
  }
`;

export const GET_MOBILE-NATIVE_ANALYTICS = gql`
  query GetMobileNativeAnalytics {
    mobilenativeAnalytics {
      totalCount
      activeCount
    }
  }
`;
