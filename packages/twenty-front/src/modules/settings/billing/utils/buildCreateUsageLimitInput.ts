import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import { type CreateUsageLimitInput } from '~/generated-metadata/graphql';

const parsePositiveInteger = (value: string): number | null => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};

const parsePositiveNumber = (value: string): number | null => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const buildCreateUsageLimitInput = (
  values: UsageLimitFormValues,
): CreateUsageLimitInput | null => {
  const scope = buildUsageQuotaScopeInput(values);

  if (!isDefined(scope)) {
    return null;
  }

  const isCreditsMeter = scope.meter === 'creditsUsedMicro';

  const limitValue = isCreditsMeter
    ? parsePositiveNumber(values.limitValue)
    : parsePositiveInteger(values.limitValue);

  if (!isDefined(limitValue)) {
    return null;
  }

  return {
    ...scope,
    limitKind: 'quota',
    periodCount: 1,
    limitValue: isCreditsMeter
      ? Math.round(limitValue * INTERNAL_CREDITS_PER_DISPLAY_CREDIT)
      : limitValue,
    burstValue: null,
  };
};
