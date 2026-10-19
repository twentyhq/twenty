import { gql } from '@apollo/client';

export const GET_USAGE_ANALYTICS = gql`
  query GetUsageAnalytics($input: UsageAnalyticsInput) {
    getUsageAnalytics(input: $input) {
      usageByUser {
        key
        label
        workspaceCreditsUsed
      }
      usageByOperationType {
        key
        workspaceCreditsUsed
      }
      usageByApplication {
        key
        label
        workspaceCreditsUsed
      }
      usageByModel {
        key
        workspaceCreditsUsed
      }
      timeSeries {
        date
        workspaceCreditsUsed
      }
      periodStart
      periodEnd
      userDailyUsage {
        userWorkspaceId
        dailyUsage {
          date
          workspaceCreditsUsed
        }
      }
    }
  }
`;
