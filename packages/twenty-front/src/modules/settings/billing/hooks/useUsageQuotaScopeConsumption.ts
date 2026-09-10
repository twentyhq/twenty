import { skipToken, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type UsageQuotaScopeConsumption } from '@/settings/billing/types/UsageQuotaScopeConsumption';
import {
  type CreateUsageLimitInput,
  UsageQuotaScopeConsumptionDocument,
  type UsageQuotaScopeInput,
} from '~/generated-metadata/graphql';

const buildScopeInput = (
  input: CreateUsageLimitInput | null,
): UsageQuotaScopeInput | null =>
  isDefined(input)
    ? {
        resourceType: input.resourceType,
        operationType: input.operationType,
        spenderType: input.spenderType,
        spenderId: input.spenderId,
        periodUnit: input.periodUnit,
        meter: input.meter,
      }
    : null;

export const useUsageQuotaScopeConsumption = (
  input: CreateUsageLimitInput | null,
): {
  scopeConsumption: UsageQuotaScopeConsumption | null;
  loading: boolean;
} => {
  const scopeInput = buildScopeInput(input);

  const { data, loading } = useQuery(
    UsageQuotaScopeConsumptionDocument,
    isDefined(scopeInput) ? { variables: { input: scopeInput } } : skipToken,
  );

  const scopeConsumption = data?.usageQuotaScopeConsumption;

  if (
    !isDefined(scopeInput) ||
    !isDefined(scopeConsumption) ||
    !isDefined(scopeConsumption.periodStart) ||
    !isDefined(scopeConsumption.periodEnd)
  ) {
    return { scopeConsumption: null, loading };
  }

  return {
    scopeConsumption: {
      consumedValue: isDefined(scopeConsumption.consumedValue)
        ? Number(scopeConsumption.consumedValue)
        : null,
      periodStart: scopeConsumption.periodStart,
      periodEnd: scopeConsumption.periodEnd,
    },
    loading,
  };
};
