import { gql } from '@apollo/client';

export const GET_CPQ_DATA = gql`
  query GetCpqData {
    cpqData {
      id
    }
  }
`;

export const CREATE_CPQ_ITEM = gql`
  mutation CreateCpqItem($input: CpqInput!) {
    createCpqItem(input: $input) {
      id
    }
  }
`;

export const GET_CPQ_ANALYTICS = gql`
  query GetCpqAnalytics {
    cpqAnalytics {
      totalCount
      activeCount
    }
  }
`;
