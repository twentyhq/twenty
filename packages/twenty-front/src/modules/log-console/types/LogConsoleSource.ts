import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';
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
  columns: LogConsoleColumn[];
  getCountLabel: (input: { count: number; formattedCount: string }) => string;
  getSeverity?: (entry: EventLogRecord) => LogConsoleSeverity | undefined;
};
