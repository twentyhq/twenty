import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

export const USAGE_LIMIT_PERIOD_NAME_LABELS: Record<
  UsageLimitPeriodUnit,
  MessageDescriptor
> = {
  day: msg`Daily`,
  week: msg`Weekly`,
  month: msg`Monthly`,
  allowancePeriod: msg`Billing period`,
};
