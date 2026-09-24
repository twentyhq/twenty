import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type SettingsLogsColumn } from '@/log-console/types/SettingsLogsColumn';
import { type SettingsLogsSeverity } from '@/log-console/types/SettingsLogsSeverity';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import {
  type EventLogRecord,
  type EventLogTable,
} from '~/generated-metadata/graphql';

export type LogConsoleSource = {
  id: LogConsoleSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  table: EventLogTable;
  requiresAuditLogs: boolean;
  columns: SettingsLogsColumn[];
  getCountLabel: (input: { count: number; formattedCount: string }) => string;
  getSeverity?: (entry: EventLogRecord) => SettingsLogsSeverity | undefined;
};
