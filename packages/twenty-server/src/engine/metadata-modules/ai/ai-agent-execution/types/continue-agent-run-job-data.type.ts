import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export type ContinueAgentRunJobData = {
  workspaceId: string;
  threadId: string;
  // the run's wake-up, which the continuation claims, and what resolved it
  wakeUpId: string;
  outcome: PendingWakeUpOutcome;
};
