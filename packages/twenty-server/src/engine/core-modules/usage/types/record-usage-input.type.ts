/* @license Enterprise */

import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';

export type RecordUsageInput = Omit<
  UsageEvent,
  'periodStart' | 'creditsUsedMicro'
> & {
  creditsUsedMicro?: number;
};
