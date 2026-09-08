import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Typed as a total Record so a queue added to the enum without a priority is a
// compile error here rather than an undefined priority at enqueue time.
export const MESSAGE_QUEUE_PRIORITY: Record<MessageQueue, number> = {
  [MessageQueue.billingQueue]: 1,
  [MessageQueue.entityEventsToDbQueue]: 1,
  [MessageQueue.emailQueue]: 1,
  [MessageQueue.workflowQueue]: 2,
  [MessageQueue.webhookQueue]: 2,
  [MessageQueue.messagingQueue]: 2,
  [MessageQueue.delayedJobsQueue]: 3,
  [MessageQueue.calendarQueue]: 4,
  [MessageQueue.contactCreationQueue]: 4,
  [MessageQueue.taskAssignedQueue]: 4,
  [MessageQueue.logicFunctionQueue]: 4,
  [MessageQueue.workspaceQueue]: 5,
  [MessageQueue.triggerQueue]: 5,
  [MessageQueue.deleteCascadeQueue]: 6,
  [MessageQueue.cronQueue]: 7,
  [MessageQueue.aiQueue]: 5,
  [MessageQueue.aiStreamQueue]: 2,
  [MessageQueue.ensoLeadPipelineQueue]: 4,
  [MessageQueue.ensoPersonMergeQueue]: 4,
  [MessageQueue.ensoCompanyEnrichmentQueue]: 4,
  [MessageQueue.ensoCompanyMergeQueue]: 4,
  [MessageQueue.ensoMarketingSyncQueue]: 4,
  [MessageQueue.ensoTelephonyQueue]: 4,
};
