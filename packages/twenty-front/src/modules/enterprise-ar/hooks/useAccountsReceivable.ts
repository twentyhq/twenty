import { gql } from '@apollo/client';

export const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      id
      number
      customerId
      customerName
      amount
      currency
      status
      issueDate
      dueDate
      createdAt
    }
  }
`;

export const GET_AGING_REPORT = gql`
  query GetAgingReport($asOfDate: DateTime, $customerId: ID) {
    agingReport(asOfDate: $asOfDate, customerId: $customerId) {
      entries {
        customerId
        customerName
        current
        days1to30
        days31to60
        days61to90
        days90plus
        total
      }
      totals {
        current
        days1to30
        days31to60
        days61to90
        days90plus
        total
      }
    }
  }
`;

export const GET_CASH_FORECAST = gql`
  query GetCashForecast($startDate: DateTime!, $endDate: DateTime!, $currency: String) {
    cashForecast(startDate: $startDate, endDate: $endDate, currency: $currency) {
      entries {
        date
        expectedInflow
        expectedOutflow
        netCash
        cumulativeBalance
      }
      summary {
        totalInflow
        totalOutflow
        netChange
        startingBalance
        endingBalance
      }
    }
  }
`;

export const GET_INVOICES = gql`
  query GetInvoices(
    $status: InvoiceStatus
    $customerId: ID
    $agingBucket: AgingBucket
    $limit: Int
    $offset: Int
  ) {
    invoices(
      status: $status
      customerId: $customerId
      agingBucket: $agingBucket
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          number
          customerName
          amount
          currency
          status
          issueDate
          dueDate
          paidAmount
          agingBucket
        }
      }
      totalCount
    }
  }
`;
