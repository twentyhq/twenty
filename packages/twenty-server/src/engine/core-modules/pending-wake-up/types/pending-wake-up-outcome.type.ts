import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';

export type PendingWakeUpOutcome =
  | { type: 'TIME_ELAPSED' }
  | { type: 'EVENT_RECEIVED'; event: PendingWakeUpEvent }
  | { type: 'EXPIRED' };
