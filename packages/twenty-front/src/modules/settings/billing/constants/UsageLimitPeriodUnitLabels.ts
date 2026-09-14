import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

export const USAGE_LIMIT_PERIOD_UNIT_LABELS: Record<
  UsageLimitPeriodUnit,
  MessageDescriptor
> = {
  day: msg`Day`,
  week: msg`Week`,
  month: msg`Month`,
  allowancePeriod: msg`Billing period`,
};
