import { MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

export const PROCESSOR_METADATA = Symbol('message-queue:processor_metadata');
export const PROCESS_METADATA = Symbol('message-queue:process_metadata');
export const QUEUE_DRIVER = Symbol('message-queue:queue_driver');

export enum MessageQueue {
  taskAssignedQueue = 'task-assigned-queue',
  messagingQueue = 'messaging-queue',
  webhookQueue = 'webhook-queue',
  cronQueue = 'cron-queue',
  emailQueue = 'email-queue',
  calendarQueue = 'calendar-queue',
  contactCreationQueue = 'contact-creation-queue',
  billingQueue = 'billing-queue',
  workspaceQueue = 'workspace-queue',
  recordPositionBackfillQueue = 'record-position-backfill-queue',
  entityEventsToDbQueue = 'entity-events-to-db-queue',
  testQueue = 'test-queue',
  workflowQueue = 'workflow-queue',
  serverlessFunctionQueue = 'serverless-function-queue',
  deleteCascadeQueue = 'delete-cascade-queue',
  subscriptionsQueue = 'subscriptions-queue',
}

export const MESSAGE_QUEUE_OPTIONS: Partial<
  Record<MessageQueue | string, MessageQueueWorkerOptions>
> = {
  [MessageQueue.workflowQueue]: {
    concurrency: 2,
  },
};
