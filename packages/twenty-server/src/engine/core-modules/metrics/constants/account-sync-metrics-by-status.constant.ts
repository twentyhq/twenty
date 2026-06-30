import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export const MESSAGE_SYNC_METRICS_BY_STATUS = [
  {
    name: 'ACTIVE',
    cacheKey: MetricsKeys.MessageChannelSyncJobActive,
  },
  {
    name: 'FAILED_UNKNOWN',
    cacheKey: MetricsKeys.MessageChannelSyncJobFailedUnknown,
  },
  {
    name: 'FAILED_INSUFFICIENT_PERMISSIONS',
    cacheKey: MetricsKeys.MessageChannelSyncJobFailedInsufficientPermissions,
  },
];

export const CALENDAR_SYNC_METRICS_BY_STATUS = [
  {
    name: 'ACTIVE',
    cacheKey: MetricsKeys.CalendarEventSyncJobActive,
  },
  {
    name: 'FAILED_UNKNOWN',
    cacheKey: MetricsKeys.CalendarEventSyncJobFailedUnknown,
  },
  {
    name: 'FAILED_INSUFFICIENT_PERMISSIONS',
    cacheKey: MetricsKeys.CalendarEventSyncJobFailedInsufficientPermissions,
  },
];
