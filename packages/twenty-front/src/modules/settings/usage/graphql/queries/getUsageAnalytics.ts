import { gql } from '@apollo/client';

export const GET_USAGE_ANALYTICS = gql`
  query GetUsageAnalytics($input: UsageAnalyticsInput) {
    getUsageAnalytics(input: $input) {
      usageByUser {
        key
        label
        creditsUsed
      }
      usageByOperationType {
        key
        creditsUsed
      }
      usageByModel {
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
