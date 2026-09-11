import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';

const CREDITS_METER: UsageLimitMeter = 'creditsUsedMicro';

export const isCreditsMeter = (meter: string): boolean =>
  meter === CREDITS_METER;
