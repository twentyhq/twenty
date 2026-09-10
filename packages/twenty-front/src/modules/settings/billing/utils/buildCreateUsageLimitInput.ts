import { isNonEmptyString } from '@sniptt/guards';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
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
  const {
    resourceType,
    operationType,
    spenderType,
    spenderId,
    meter,
    periodUnit,
  } = values;

  if (
    !isDefined(resourceType) ||
    !isDefined(operationType) ||
    !isDefined(spenderType) ||
    !isDefined(meter) ||
    !isDefined(periodUnit)
  ) {
    return null;
  }

  const limitValue =
    meter === 'creditsUsedMicro'
      ? parsePositiveNumber(values.limitValue)
      : parsePositiveInteger(values.limitValue);

  if (!isDefined(limitValue)) {
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
    limitKind: 'quota',
    periodCount: 1,
    periodUnit,
    meter,
    limitValue:
      meter === 'creditsUsedMicro'
        ? Math.round(limitValue * INTERNAL_CREDITS_PER_DISPLAY_CREDIT)
        : limitValue,
    burstValue: null,
  };
};
