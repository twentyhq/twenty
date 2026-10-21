import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';

// What a conversation waits on before it takes another message or run
export type AgentConversationWait = {
  // the question the assistant asked the member in the conversation
  pendingQuestionMessageId: string | null;
  suspendedRun: Pick<PendingWakeUpEntity, 'id'> | null;
  // a call a caller such as a workflow step posted, which waits on its own answer
  hasPostedCall: boolean;
  isWaiting: boolean;
};
