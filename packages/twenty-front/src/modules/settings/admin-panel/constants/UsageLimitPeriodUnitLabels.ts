import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Keyed on the server's whole PERIOD_UNITS set, unlike the workspace billing map,
// which only covers the anchored units its quota form offers.
export const ADMIN_USAGE_LIMIT_PERIOD_UNIT_LABELS: Record<
  string,
  MessageDescriptor
> = {
  second: msg`Seconds`,
  day: msg`Day`,
  week: msg`Week`,
  month: msg`Month`,
  allowancePeriod: msg`Billing period`,
  lifetime: msg`Lifetime`,
};
