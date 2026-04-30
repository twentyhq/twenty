import { gql } from '@apollo/client';

export const GET_SALES-EXECUTION_DATA = gql`
  query GetSalesExecutionData {
    salesexecutionData {
      id
    }
  }
`;

export const CREATE_SALES-EXECUTION_ITEM = gql`
  mutation CreateSalesExecutionItem($input: SalesExecutionInput!) {
    createSalesExecutionItem(input: $input) {
      id
    }
  }
`;

export const GET_SALES-EXECUTION_ANALYTICS = gql`
  query GetSalesExecutionAnalytics {
    salesexecutionAnalytics {
      totalCount
      activeCount
    }
  }
`;
