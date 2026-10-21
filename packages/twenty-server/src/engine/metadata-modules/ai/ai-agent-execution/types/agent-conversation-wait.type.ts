import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';

export type AgentConversationWait = {
  pendingQuestionMessageId: string | null;
  suspendedRun: Pick<PendingWakeUpEntity, 'id'> | null;
  // a call a caller such as a workflow step posted, which waits on its own answer
  hasPostedCall: boolean;
  isWaiting: boolean;
};
