export enum MetricsKeys {
  MessageChannelSyncJobActive = 'message-channel-sync-job/active',
  MessageChannelSyncJobFailedInsufficientPermissions = 'message-channel-sync-job/failed-insufficient-permissions',
  MessageChannelSyncJobFailedUnknown = 'message-channel-sync-job/failed-unknown',
  CalendarEventSyncJobActive = 'calendar-event-sync-job/active',
  CalendarEventSyncJobFailedInsufficientPermissions = 'calendar-event-sync-job/failed-insufficient-permissions',
  CalendarEventSyncJobFailedUnknown = 'calendar-event-sync-job/failed-unknown',
  InvalidCaptcha = 'invalid-captcha',
  RunWorkflowJobDatabaseEventTrigger = 'run-workflow-job/database-event-trigger',
  RunWorkflowJobCronTrigger = 'run-workflow-job/cron-trigger',
  RunWorkflowJobWebhookTrigger = 'run-workflow-job/webhook-trigger',
  RunWorkflowJobManualTrigger = 'run-workflow-job/manual-trigger',
}
