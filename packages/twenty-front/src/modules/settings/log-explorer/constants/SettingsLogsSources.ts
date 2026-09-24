import { msg } from '@lingui/core/macro';
import {
  IconAddressBook,
  IconCoins,
  IconEye,
  IconTerminal,
} from 'twenty-ui/icon';

import { type SettingsLogsSource } from '@/settings/log-explorer/types/SettingsLogsSource';
import { EventLogTable } from '~/generated-metadata/graphql';

export const SETTINGS_LOGS_SOURCES: SettingsLogsSource[] = [
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
    Icon: IconCoins,
    table: EventLogTable.USAGE_EVENT,
    requiresAuditLogs: true,
  },
];
