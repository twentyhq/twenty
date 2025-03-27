export enum MetricsCounterKeys {
  MessageChannelSyncJobActive = 'message-channel-sync-job/active',
  MessageChannelSyncJobFailedInsufficientPermissions = 'message-channel-sync-job/failed-insufficient-permissions',
  MessageChannelSyncJobFailedUnknown = 'message-channel-sync-job/failed-unknown',
  CalendarEventSyncJobActive = 'calendar-event-sync-job/active',
  CalendarEventSyncJobFailedInsufficientPermissions = 'calendar-event-sync-job/failed-insufficient-permissions',
  CalendarEventSyncJobFailedUnknown = 'calendar-event-sync-job/failed-unknown',
  InvalidCaptcha = 'invalid-captcha',
}

export enum MeterKeys {
  MessageChannelSyncJob = 'message-channel-sync-job',
  CalendarEventSyncJob = 'calendar-event-sync-job',
  InvalidCaptcha = 'invalid-captcha',
}
