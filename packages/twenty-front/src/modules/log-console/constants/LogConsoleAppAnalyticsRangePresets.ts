import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type LogConsoleAppAnalyticsRangePreset } from '@/log-console/types/LogConsoleAppAnalyticsRangePreset';

// A preset without lastDays spans from the app registration up to today
export const LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS: Record<
  LogConsoleAppAnalyticsRangePreset,
  { label: MessageDescriptor; lastDays?: number }
> = {
  '7d': { label: msg`Last 7 days`, lastDays: 7 },
  '30d': { label: msg`Last 30 days`, lastDays: 30 },
  '90d': { label: msg`Last 90 days`, lastDays: 90 },
  '1y': { label: msg`Last year`, lastDays: 365 },
  all: { label: msg`All time` },
};
