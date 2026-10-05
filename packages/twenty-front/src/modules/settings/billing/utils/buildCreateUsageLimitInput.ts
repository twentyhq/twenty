import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { type CreateUsageLimitInput } from '~/generated-metadata/graphql';

export const buildCreateUsageLimitInput = (
  values: UsageLimitFormValues,
): CreateUsageLimitInput | null => {
  const scope = buildUsageQuotaScopeInput(values);

  if (!isDefined(scope)) {
    return null;
  }

  const limitValue = Math.round(
    Number(values.limitValue) * getUsageLimitInputScale(scope.unit),
  );

  if (!Number.isSafeInteger(limitValue) || limitValue < 1) {
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
