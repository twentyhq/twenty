import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';

export type PendingWakeUpOutcome =
  | { type: 'TIME_ELAPSED' }
  | { type: 'EVENT_RECEIVED'; event: PendingWakeUpEvent }
  | { type: 'EXPIRED' }
  // what came of the answer, which the owner takes as its own outcome
  | { type: 'ANSWERED'; answer: { result: object } | { error: string } };
