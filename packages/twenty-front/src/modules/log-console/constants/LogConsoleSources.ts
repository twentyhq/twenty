import { msg, plural } from '@lingui/core/macro';
import {
  IconAddressBook,
  IconEye,
  IconGauge,
  IconTerminal,
} from 'twenty-ui/icon';

import { SETTINGS_LOGS_APPLICATION_LOG_COLUMNS } from '@/log-console/constants/SettingsLogsApplicationLogColumns';
import { SETTINGS_LOGS_EVENT_COLUMNS } from '@/log-console/constants/SettingsLogsEventColumns';
import { SETTINGS_LOGS_LEVELS } from '@/log-console/constants/SettingsLogsLevels';
import { SETTINGS_LOGS_USAGE_EVENT_COLUMNS } from '@/log-console/constants/SettingsLogsUsageEventColumns';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { EventLogTable } from '~/generated-metadata/graphql';

export const LOG_CONSOLE_SOURCES: LogConsoleSource[] = [
  {
    id: 'record-changes',
    label: msg`Record changes`,
    Icon: IconAddressBook,
    table: EventLogTable.OBJECT_EVENT,
    requiresAuditLogs: true,
    columns: SETTINGS_LOGS_EVENT_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} change`,
        other: `${formattedCount} changes`,
      }),
  },
  {
    id: 'app-logs',
    label: msg`App logs`,
    Icon: IconTerminal,
    table: EventLogTable.APPLICATION_LOG,
    requiresAuditLogs: false,
    columns: SETTINGS_LOGS_APPLICATION_LOG_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} log line`,
        other: `${formattedCount} log lines`,
      }),
    getSeverity: (entry) =>
      SETTINGS_LOGS_LEVELS[entry.properties?.level]?.severity,
  },
  {
    id: 'page-views',
    label: msg`Page views`,
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    requiresAuditLogs: true,
    columns: SETTINGS_LOGS_EVENT_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} page view`,
        other: `${formattedCount} page views`,
      }),
  },
  {
    id: 'usage',
    label: msg`Usage`,
    Icon: IconGauge,
    table: EventLogTable.USAGE_EVENT,
    requiresAuditLogs: true,
    columns: SETTINGS_LOGS_USAGE_EVENT_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} usage event`,
        other: `${formattedCount} usage events`,
      }),
  },
];
