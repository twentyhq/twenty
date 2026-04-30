import { gql } from '@apollo/client';

export const GET_TRADE-IMPORT_DATA = gql`
  query GetTradeImportData {
    tradeimportData {
      id
    }
  }
`;

export const CREATE_TRADE-IMPORT_ITEM = gql`
  mutation CreateTradeImportItem($input: TradeImportInput!) {
    createTradeImportItem(input: $input) {
      id
    }
  }
`;

export const GET_TRADE-IMPORT_ANALYTICS = gql`
  query GetTradeImportAnalytics {
    tradeimportAnalytics {
      totalCount
      activeCount
    }
  }
`;
