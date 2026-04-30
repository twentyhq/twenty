import { gql } from '@apollo/client';

export const GET_FISCAL_DATA = gql`
  query GetFiscalData {
    fiscalData {
      id
    }
  }
`;

export const CREATE_FISCAL_ITEM = gql`
  mutation CreateFiscalItem($input: FiscalInput!) {
    createFiscalItem(input: $input) {
      id
    }
  }
`;

export const GET_FISCAL_ANALYTICS = gql`
  query GetFiscalAnalytics {
    fiscalAnalytics {
      totalCount
      activeCount
    }
  }
`;
