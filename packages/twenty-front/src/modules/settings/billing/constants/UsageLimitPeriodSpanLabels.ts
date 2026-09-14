import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

export const USAGE_LIMIT_PERIOD_SPAN_LABELS: Record<
  UsageLimitPeriodUnit,
  MessageDescriptor
> = {
  day: msg`Today`,
  week: msg`This week`,
  month: msg`This month`,
  allowancePeriod: msg`This billing period`,
};
