import { gql } from '@apollo/client';

export const GET_DATA-RESIDENCY_DATA = gql`
  query GetDataResidencyData {
    dataresidencyData {
      id
    }
  }
`;

export const CREATE_DATA-RESIDENCY_ITEM = gql`
  mutation CreateDataResidencyItem($input: DataResidencyInput!) {
    createDataResidencyItem(input: $input) {
      id
    }
  }
`;

export const GET_DATA-RESIDENCY_ANALYTICS = gql`
  query GetDataResidencyAnalytics {
    dataresidencyAnalytics {
      totalCount
      activeCount
    }
  }
`;
