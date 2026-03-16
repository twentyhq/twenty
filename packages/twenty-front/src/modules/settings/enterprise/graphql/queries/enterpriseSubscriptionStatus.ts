import { gql } from '@apollo/client';

export const ENTERPRISE_SUBSCRIPTION_STATUS = gql`
  query EnterpriseSubscriptionStatus {
    enterpriseSubscriptionStatus {
      status
      licensee
      expiresAt
      cancelAt
      currentPeriodEnd
      isCancellationScheduled
    }
  }
`;
