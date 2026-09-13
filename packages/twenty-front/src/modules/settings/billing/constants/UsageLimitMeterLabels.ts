import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';

export const USAGE_LIMIT_METER_LABELS: Record<
  UsageLimitMeter,
  MessageDescriptor
> = {
  creditsUsedMicro: msg`Credits`,
  quantity: msg`Operations`,
};
