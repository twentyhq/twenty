import { skipToken, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageQuotaScopeConsumption } from '@/settings/billing/types/UsageQuotaScopeConsumption';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import { UsageQuotaScopeConsumptionDocument } from '~/generated-metadata/graphql';

export const useUsageQuotaScopeConsumption = ({
  resourceType,
  operationType,
  spenderType,
  spenderId,
  meter,
  periodUnit,
}: Omit<UsageLimitFormValues, 'limitValue'>): {
  scopeConsumption: UsageQuotaScopeConsumption | null;
  loading: boolean;
} => {
  const scopeInput = useMemo(
    () =>
      buildUsageQuotaScopeInput({
        resourceType,
        operationType,
        spenderType,
        spenderId,
        meter,
        periodUnit,
      }),
    [resourceType, operationType, spenderType, spenderId, meter, periodUnit],
  );

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
