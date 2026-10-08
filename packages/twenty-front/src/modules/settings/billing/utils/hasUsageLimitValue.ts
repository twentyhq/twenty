import { isNonEmptyString } from '@sniptt/guards';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';

export const hasUsageLimitValue = (
  values: Pick<UsageLimitFormValues, 'limitValue'>,
): boolean => isNonEmptyString(values.limitValue.trim());
