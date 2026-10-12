import { gql } from '@apollo/client';

export const USAGE_QUOTAS_WITH_CONSUMPTION = gql`
  query UsageQuotasWithConsumption {
    usageQuotasWithConsumption {
      id
      resourceType
      operationType
      spenderType
      spenderId
      spenderLabel
      periodUnit
      unit
      limitValue
      isEnforced
      consumedValue
      remainingValue
      periodStart
      periodEnd
    }
  }
`;
