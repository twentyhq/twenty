import { gql } from '@apollo/client';

export const GET_ECOMMERCE_ANALYTICS = gql`
  query GetECommerceAnalytics($dateRange: DateRangeInput) {
    ecommerceAnalytics(dateRange: $dateRange) {
      totalOrders
      totalRevenue
      avgOrderValue
      conversionRate
      cartAbandonmentRate
      returningCustomerRate
      currency
      bySource {
        source
        orders
        revenue
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      customerName
      status
      source
      amount
      currency
      itemCount
      createdAt
    }
  }
`;

export const TRACK_ABANDONED_CART = gql`
  query TrackAbandonedCarts(
    $dateRange: DateRangeInput
    $recovered: Boolean
    $limit: Int
    $offset: Int
  ) {
    abandonedCarts(
      dateRange: $dateRange
      recovered: $recovered
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          customerEmail
          itemCount
          cartValue
          currency
          abandonedAt
          recoveryEmailSent
          recovered
        }
      }
      totalCount
      totalValue
    }
  }
`;

export const GET_AI_RECOMMENDATIONS = gql`
  query GetAIRecommendations($customerId: ID!, $limit: Int) {
    aiProductRecommendations(customerId: $customerId, limit: $limit) {
      products {
        id
        name
        price
        currency
        imageUrl
        confidenceScore
        reason
      }
    }
  }
`;

export const GET_COHORT_RETENTION = gql`
  query GetCohortRetention($startMonth: String!, $monthsBack: Int!) {
    cohortRetention(startMonth: $startMonth, monthsBack: $monthsBack) {
      cohorts {
        cohortMonth
        initialCustomers
        retentionByMonth {
          month
          retainedCount
          retentionRate
        }
      }
    }
  }
`;
