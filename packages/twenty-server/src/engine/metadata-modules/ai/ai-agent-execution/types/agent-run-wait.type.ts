import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

// the wait call a run paused on, and what wakes it up
export type AgentRunWait = {
  toolCallId: string;
  condition: PendingWakeUpCondition;
};
