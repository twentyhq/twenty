import { gql } from '@apollo/client';

export const CREATE_PR = gql`
  mutation CreatePurchaseRequest($input: CreatePurchaseRequestInput!) {
    createPurchaseRequest(input: $input) {
      id
      title
      requester
      department
      status
      totalAmount
      currency
      submittedAt
      approver
    }
  }
`;

export const APPROVE_PR = gql`
  mutation ApprovePurchaseRequest($prId: ID!, $comment: String) {
    approvePurchaseRequest(prId: $prId, comment: $comment) {
      id
      title
      status
      approver
      approvedAt
    }
  }
`;

export const CREATE_RFQ = gql`
  mutation CreateRFQ($input: CreateRFQInput!) {
    createRFQ(input: $input) {
      id
      itemName
      quantity
      quotes {
        supplierId
        supplierName
        unitPrice
        leadTimeDays
        warranty
        rating
        currency
      }
    }
  }
`;

export const COMPARE_RFQ_RESPONSES = gql`
  query CompareRFQResponses($rfqId: ID!) {
    compareRFQResponses(rfqId: $rfqId) {
      rfqId
      itemName
      quantity
      quotes {
        supplierId
        supplierName
        unitPrice
        leadTimeDays
        warranty
        rating
        currency
      }
      recommendation {
        supplierId
        supplierName
        reason
      }
    }
  }
`;

export const GET_SPEND_BY_CATEGORY = gql`
  query GetSpendByCategory($dateRange: DateRangeInput) {
    spendByCategory(dateRange: $dateRange) {
      categories {
        category
        amount
        percentage
        currency
      }
      totalSpend
      currency
    }
  }
`;
