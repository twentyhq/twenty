import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { type CreateUsageLimitInput } from '~/generated-metadata/graphql';

export const buildCreateUsageLimitInput = (
  values: UsageLimitFormValues,
): CreateUsageLimitInput | null => {
  const scope = buildUsageQuotaScopeInput(values);

  if (!isDefined(scope) || !isNonEmptyString(values.limitValue.trim())) {
    return null;
  }

  const inputValue = Number(values.limitValue);
  const limitValue = Math.round(
    inputValue * getUsageLimitInputScale(scope.unit),
  );

  if (
    !Number.isSafeInteger(limitValue) ||
    limitValue < 0 ||
    (limitValue === 0 && inputValue !== 0)
  ) {
    return null;
  }

  return {
    ...scope,
    limitKind: 'quota',
    periodCount: 1,
    limitValue,
    burstValue: null,
  };
};
