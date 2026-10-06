import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

export type AgentWaitPendingOutput = {
  success: true;
  message: string;
  result: { status: 'pending'; wait: PendingWakeUpCondition };
};
