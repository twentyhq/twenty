import { msg } from '@lingui/core/macro';
import {
  IconAddressBook,
  IconEye,
  IconGauge,
  IconTerminal,
} from 'twenty-ui/icon';

import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { EventLogTable } from '~/generated-metadata/graphql';

export const LOG_CONSOLE_SOURCES: LogConsoleSource[] = [
  {
    id: 'record-changes',
    label: msg`Record changes`,
    Icon: IconAddressBook,
    table: EventLogTable.OBJECT_EVENT,
    requiresAuditLogs: true,
  },
  {
    id: 'app-logs',
    label: msg`App logs`,
    Icon: IconTerminal,
    table: EventLogTable.APPLICATION_LOG,
    requiresAuditLogs: false,
  },
  {
    id: 'page-views',
    label: msg`Page views`,
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    requiresAuditLogs: true,
  },
  {
    id: 'usage',
    label: msg`Usage`,
    Icon: IconGauge,
    table: EventLogTable.USAGE_EVENT,
    requiresAuditLogs: true,
  },
];
