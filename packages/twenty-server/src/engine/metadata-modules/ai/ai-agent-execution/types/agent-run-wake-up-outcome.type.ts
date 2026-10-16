import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

// a member writing in the conversation wakes a run up too, and the run reads what they wrote
export type AgentRunWakeUpOutcome =
  | PendingWakeUpOutcome
  | { type: 'MESSAGE_RECEIVED' };
