import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildUsageQuotaScopeInput } from '@/settings/billing/utils/buildUsageQuotaScopeInput';
import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { parseUsageLimitValue } from '@/settings/billing/utils/parseUsageLimitValue';
import { type CreateUsageLimitInput } from '~/generated-metadata/graphql';

export const buildCreateUsageLimitInput = (
  values: UsageLimitFormValues,
): CreateUsageLimitInput | null => {
  const scope = buildUsageQuotaScopeInput(values);

  if (!isDefined(scope)) {
    return null;
  }

  const limitValue = parseUsageLimitValue({
    value: values.limitValue,
    min: 0,
    scale: getUsageLimitInputScale(scope.unit),
  });

  if (!isDefined(limitValue)) {
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
