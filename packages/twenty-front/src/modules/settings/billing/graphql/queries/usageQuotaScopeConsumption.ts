import { gql } from '@apollo/client';

export const USAGE_QUOTA_SCOPE_CONSUMPTION = gql`
  query UsageQuotaScopeConsumption($input: UsageQuotaScopeInput!) {
    usageQuotaScopeConsumption(input: $input) {
      consumedValue
      periodStart
      periodEnd
    }
  }
`;
