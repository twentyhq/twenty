import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';

import { type LogConsoleTimeRangePreset } from '@/log-console/types/LogConsoleTimeRangePreset';

export const LOG_CONSOLE_TIME_RANGE_PRESETS: Record<
  LogConsoleTimeRangePreset,
  { label: MessageDescriptor; duration: Temporal.DurationLike }
> = {
  '15m': { label: msg`Last 15 minutes`, duration: { minutes: 15 } },
  '1h': { label: msg`Last 1 hour`, duration: { hours: 1 } },
  '4h': { label: msg`Last 4 hours`, duration: { hours: 4 } },
  '24h': { label: msg`Last 24 hours`, duration: { hours: 24 } },
  '7d': { label: msg`Last 7 days`, duration: { days: 7 } },
  '30d': { label: msg`Last 30 days`, duration: { days: 30 } },
  '90d': { label: msg`Last 90 days`, duration: { days: 90 } },
};
