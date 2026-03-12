import { gql } from '@apollo/client';

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics(
    $periodStart: DateTime
    $periodEnd: DateTime
    $userWorkspaceId: String
  ) {
    getBillingAnalytics(
      periodStart: $periodStart
      periodEnd: $periodEnd
      userWorkspaceId: $userWorkspaceId
    ) {
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
