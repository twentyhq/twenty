import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export type AgentRunWakeUpOutcome =
  | PendingWakeUpOutcome
  | { type: 'MESSAGE_RECEIVED' };
