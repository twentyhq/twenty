import { gql } from '@apollo/client';

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics($input: BillingAnalyticsInput) {
    getBillingAnalytics(input: $input) {
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
      userDailyUsage {
        userWorkspaceId
        dailyUsage {
          date
          creditsUsed
        }
      }
    }
  }
`;
