export const PROCESSOR_METADATA = Symbol('message-queue:processor_metadata');
export const PROCESS_METADATA = Symbol('message-queue:process_metadata');
export const QUEUE_DRIVER = Symbol('message-queue:queue_driver');

export enum MessageQueue {
  recordExportQueue = 'record-export-queue',
  taskAssignedQueue = 'task-assigned-queue',
  messagingQueue = 'messaging-queue',
  webhookQueue = 'webhook-queue',
  cronQueue = 'cron-queue',
  emailQueue = 'email-queue',
  campaignQueue = 'campaign-queue',
  campaignSendQueue = 'campaign-send-queue',
  campaignEngagementQueue = 'campaign-engagement-queue',
  calendarQueue = 'calendar-queue',
  connectedAccountSyncWebhookQueue = 'connected-account-sync-webhook-queue',
  contactCreationQueue = 'contact-creation-queue',
  billingQueue = 'billing-queue',
  workspaceQueue = 'workspace-queue',
  entityEventsToDbQueue = 'entity-events-to-db-queue',
  eventLogQueue = 'event-log-queue',
  workflowQueue = 'workflow-queue',
  delayedJobsQueue = 'delayed-jobs-queue',
  deleteCascadeQueue = 'delete-cascade-queue',
  logicFunctionQueue = 'logic-function-queue',
  applicationLifecycleHookQueue = 'application-lifecycle-hook-queue',
  applicationUpgradeQueue = 'application-upgrade-queue',
  triggerQueue = 'trigger-queue',
  aiQueue = 'ai-queue',
  aiStreamQueue = 'ai-stream-queue',
}
