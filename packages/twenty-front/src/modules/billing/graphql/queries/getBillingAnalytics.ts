import { gql } from '@apollo/client';

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics {
    getBillingAnalytics {
      usageByUser {
        key
        creditsUsed
      }
      usageByResource {
        key
        creditsUsed
      }
      usageByExecutionType {
        key
        creditsUsed
      }
      timeSeries {
        date
        creditsUsed
      }
      periodStart
      periodEnd
    }
  }
`;
