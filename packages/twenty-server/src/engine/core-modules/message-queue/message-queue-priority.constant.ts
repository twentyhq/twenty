import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const MESSAGE_QUEUE_PRIORITY = {
  [MessageQueue.workflowDelayedJobsQueue]: 1,
  [MessageQueue.billingQueue]: 2,
  [MessageQueue.workflowQueue]: 2,
  [MessageQueue.emailQueue]: 5,
  [MessageQueue.webhookQueue]: 8,
  [MessageQueue.messagingQueue]: 10,
  [MessageQueue.calendarQueue]: 10,
  [MessageQueue.contactCreationQueue]: 10,
  [MessageQueue.workspaceQueue]: 10,
  [MessageQueue.entityEventsToDbQueue]: 10,
  [MessageQueue.deleteCascadeQueue]: 20,
  [MessageQueue.serverlessFunctionQueue]: 10,
  [MessageQueue.triggerQueue]: 10,
  [MessageQueue.taskAssignedQueue]: 10,
  [MessageQueue.cronQueue]: 10,
};
