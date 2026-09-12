import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageQuotaScopeInput } from '~/generated-metadata/graphql';

export const buildUsageQuotaScopeInput = ({
  resourceType,
  operationType,
  spenderType,
  spenderId,
  meter,
  periodUnit,
}: Omit<UsageLimitFormValues, 'limitValue'>): UsageQuotaScopeInput | null => {
  if (
    !isDefined(resourceType) ||
    !isDefined(operationType) ||
    !isDefined(spenderType) ||
    !isDefined(meter) ||
    !isDefined(periodUnit)
  ) {
    return null;
  }

  return {
    resourceType,
    operationType,
    spenderType,
    spenderId:
      spenderType !== 'workspace' && isNonEmptyString(spenderId.trim())
        ? spenderId.trim()
        : null,
    meter,
    periodUnit,
  };
};
