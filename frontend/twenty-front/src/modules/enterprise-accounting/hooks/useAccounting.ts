import { gql } from '@apollo/client';

export const GET_TRIAL_BALANCE = gql`
  query GetTrialBalance($asOfDate: String!, $periodId: ID) {
    trialBalance(asOfDate: $asOfDate, periodId: $periodId) {
      accounts {
        id
        code
        name
        type
        debitBalance
        creditBalance
      }
      totalDebits
      totalCredits
      isBalanced
    }
  }
`;

export const CREATE_JOURNAL_ENTRY = gql`
  mutation CreateJournalEntry($input: CreateJournalEntryInput!) {
    createJournalEntry(input: $input) {
      id
      date
      description
      lines {
        accountId
        accountName
        debit
        credit
      }
      createdBy
      status
    }
  }
`;

export const GET_PROFIT_AND_LOSS = gql`
  query GetProfitAndLoss($startDate: String!, $endDate: String!) {
    profitAndLoss(startDate: $startDate, endDate: $endDate) {
      revenue {
        label
        amount
        isTotal
      }
      costOfSales {
        label
        amount
        isTotal
      }
      operatingExpenses {
        label
        amount
        isTotal
      }
      grossProfit
      operatingIncome
      netIncome
      currency
    }
  }
`;

export const GET_BALANCE_SHEET = gql`
  query GetBalanceSheet($asOfDate: String!) {
    balanceSheet(asOfDate: $asOfDate) {
      assets {
        label
        amount
        isTotal
      }
      liabilities {
        label
        amount
        isTotal
      }
      equity {
        label
        amount
        isTotal
      }
      totalAssets
      totalLiabilitiesAndEquity
      isBalanced
      currency
    }
  }
`;

export const CLOSE_PERIOD = gql`
  mutation ClosePeriod($periodId: ID!) {
    closePeriod(periodId: $periodId) {
      periodId
      label
      startDate
      endDate
      status
      closedAt
      closedBy
    }
  }
`;
