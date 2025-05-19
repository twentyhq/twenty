import { msg } from '@lingui/core/macro';
import { QueueMetricsTimeRange } from '~/generated/graphql';

export const WORKER_QUEUE_METRICS_SELECT_OPTIONS = [
  { value: QueueMetricsTimeRange.SevenDays, label: msg`This week` },
  { value: QueueMetricsTimeRange.OneDay, label: msg`Today` },
  {
    value: QueueMetricsTimeRange.TwelveHours,
    label: msg`Last 12 hours`,
  },
  {
    value: QueueMetricsTimeRange.FourHours,
    label: msg`Last 4 hours`,
  },
  { value: QueueMetricsTimeRange.OneHour, label: msg`Last 1 hour` },
];
