import { gql } from '@apollo/client';

export const GET_OMNICANAL_DATA = gql`
  query GetOmnicanalData {
    omnicanalData {
      id
    }
  }
`;

export const CREATE_OMNICANAL_ITEM = gql`
  mutation CreateOmnicanalItem($input: OmnicanalInput!) {
    createOmnicanalItem(input: $input) {
      id
    }
  }
`;

export const GET_OMNICANAL_ANALYTICS = gql`
  query GetOmnicanalAnalytics {
    omnicanalAnalytics {
      totalCount
      activeCount
    }
  }
`;
