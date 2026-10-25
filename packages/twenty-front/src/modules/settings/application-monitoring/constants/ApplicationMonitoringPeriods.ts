import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';

export const APPLICATION_MONITORING_PERIODS: {
  value: ApplicationMonitoringPeriod;
  hours: number;
  label: MessageDescriptor;
  chartAxisLabel: MessageDescriptor;
}[] = [
  {
    value: '2h',
    hours: 2,
    label: msg`Last 2 hours`,
    chartAxisLabel: msg`Last 2 hours (oldest → newest)`,
  },
  {
    value: '24h',
    hours: 24,
    label: msg`Last 24 hours`,
    chartAxisLabel: msg`Last 24 hours (oldest → newest)`,
  },
  {
    value: '7d',
    hours: 7 * 24,
    label: msg`Last 7 days`,
    chartAxisLabel: msg`Last 7 days (oldest → newest)`,
  },
  {
    value: '30d',
    hours: 30 * 24,
    label: msg`Last 30 days`,
    chartAxisLabel: msg`Last 30 days (oldest → newest)`,
  },
  {
    value: '90d',
    hours: 90 * 24,
    label: msg`Last 90 days`,
    chartAxisLabel: msg`Last 90 days (oldest → newest)`,
  },
];
