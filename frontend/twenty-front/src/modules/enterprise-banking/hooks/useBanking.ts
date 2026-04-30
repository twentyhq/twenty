import { gql } from '@apollo/client';

export const GET_BANKING_DATA = gql`
  query GetBankingData {
    bankingData {
      id
    }
  }
`;

export const CREATE_BANKING_ITEM = gql`
  mutation CreateBankingItem($input: BankingInput!) {
    createBankingItem(input: $input) {
      id
    }
  }
`;

export const GET_BANKING_ANALYTICS = gql`
  query GetBankingAnalytics {
    bankingAnalytics {
      totalCount
      activeCount
    }
  }
`;
