import { QUOTA_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';

export const isQuotaMeter = (meter: UsageMeter): meter is QuotaMeter =>
  QUOTA_METERS.includes(meter as QuotaMeter);
