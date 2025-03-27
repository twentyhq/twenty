import { MetricsCounterKeys } from 'src/engine/core-modules/metrics/types/metrics-counter-keys.type';

export const MESSAGE_SYNC_METRICS_BY_STATUS = [
  {
    name: 'ACTIVE',
    cacheKey: MetricsCounterKeys.MessageChannelSyncJobActive,
  },
  {
    name: 'FAILED_UNKNOWN',
    cacheKey: MetricsCounterKeys.MessageChannelSyncJobFailedUnknown,
  },
  {
    name: 'FAILED_INSUFFICIENT_PERMISSIONS',
    cacheKey:
      MetricsCounterKeys.MessageChannelSyncJobFailedInsufficientPermissions,
  },
];

export const CALENDAR_SYNC_METRICS_BY_STATUS = [
  {
    name: 'ACTIVE',
    cacheKey: MetricsCounterKeys.CalendarEventSyncJobActive,
  },
  {
    name: 'FAILED_UNKNOWN',
    cacheKey: MetricsCounterKeys.CalendarEventSyncJobFailedUnknown,
  },
  {
    name: 'FAILED_INSUFFICIENT_PERMISSIONS',
    cacheKey:
      MetricsCounterKeys.CalendarEventSyncJobFailedInsufficientPermissions,
  },
];
