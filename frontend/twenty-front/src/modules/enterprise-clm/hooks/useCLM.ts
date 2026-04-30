import { gql } from '@apollo/client';

export const GET_CONTRACT_ANALYTICS = gql`
  query GetContractAnalytics($dateRange: DateRangeInput) {
    contractAnalytics(dateRange: $dateRange) {
      totalContracts
      activeContracts
      totalValue
      avgContractValue
      renewalRate
      avgNegotiationDays
      currency
      byStatus {
        status
        count
        value
      }
    }
  }
`;

export const CREATE_CONTRACT_FROM_DEAL = gql`
  mutation CreateContractFromDeal($dealId: ID!, $input: CreateContractInput!) {
    createContractFromDeal(dealId: $dealId, input: $input) {
      id
      title
      counterparty
      status
      value
      currency
      startDate
      endDate
      owner
    }
  }
`;

export const SIGN_CONTRACT = gql`
  mutation SignContract($contractId: ID!, $signerId: ID!) {
    signContract(contractId: $contractId, signerId: $signerId) {
      id
      title
      status
      signedAt
      signedBy
    }
  }
`;

export const GET_EXPIRING_CONTRACTS = gql`
  query GetExpiringContracts($withinDays: Int!, $limit: Int) {
    expiringContracts(withinDays: $withinDays, limit: $limit) {
      edges {
        node {
          id
          title
          counterparty
          status
          value
          currency
          endDate
          owner
          daysUntilExpiry
        }
      }
      totalCount
    }
  }
`;

export const SCORE_RISK = gql`
  query ScoreContractRisk($contractId: ID!) {
    contractRiskScore(contractId: $contractId) {
      contractId
      overallScore
      riskLevel
      factors {
        name
        score
        weight
        description
      }
      recommendations
    }
  }
`;
