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
  entityEventsToDbQueue = 'entity-events-to-db-queue',
  workflowQueue = 'workflow-queue',
  delayedJobsQueue = 'delayed-jobs-queue',
  deleteCascadeQueue = 'delete-cascade-queue',
  logicFunctionQueue = 'logic-function-queue',
  triggerQueue = 'trigger-queue',
  aiQueue = 'ai-queue',
  // Dedicated queue for AI chat streaming jobs. Separate from aiQueue
  // so long-running streams (potentially minutes) don't starve short
  // evaluation jobs.
  // TODO: Increase concurrency for production. Streaming is I/O-bound
  // (waiting for LLM tokens), so a single worker can handle 50+
  // concurrent streams. Default concurrency is 1 — set it in
  // QUEUE_WORKER_OPTIONS when ready to support concurrent users.
  aiStreamQueue = 'ai-stream-queue',
}
