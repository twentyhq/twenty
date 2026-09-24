import { msg, plural } from '@lingui/core/macro';
import {
  IconAddressBook,
  IconEye,
  IconGauge,
  IconTerminal,
} from 'twenty-ui/icon';

import { LOG_CONSOLE_APPLICATION_LOG_COLUMNS } from '@/log-console/constants/LogConsoleApplicationLogColumns';
import { LOG_CONSOLE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleEventColumns';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_USAGE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleUsageEventColumns';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { EventLogTable } from '~/generated-metadata/graphql';

export const LOG_CONSOLE_SOURCES: LogConsoleSource[] = [
  {
    id: 'record-changes',
    label: msg`Record changes`,
    Icon: IconAddressBook,
    table: EventLogTable.OBJECT_EVENT,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_EVENT_COLUMNS,
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
    columns: LOG_CONSOLE_APPLICATION_LOG_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} log`,
        other: `${formattedCount} logs`,
      }),
    getSeverity: (entry) =>
      LOG_CONSOLE_LEVELS[entry.properties?.level]?.severity,
  },
  {
    id: 'page-views',
    label: msg`Page views`,
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_EVENT_COLUMNS,
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
    columns: LOG_CONSOLE_USAGE_EVENT_COLUMNS,
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} usage event`,
        other: `${formattedCount} usage events`,
      }),
  },
];
