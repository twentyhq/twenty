import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const MESSAGE_QUEUE_PRIORITY = {
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
  [MessageQueue.serverlessFunctionQueue]: 4,
  [MessageQueue.workspaceQueue]: 5,
  [MessageQueue.triggerQueue]: 5,
  [MessageQueue.deleteCascadeQueue]: 6,
  [MessageQueue.cronQueue]: 7,
  [MessageQueue.aiQueue]: 5,
};
