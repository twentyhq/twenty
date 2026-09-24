import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type SettingsLogsColumn } from '@/settings/log-explorer/types/SettingsLogsColumn';
import { type SettingsLogsSeverity } from '@/settings/log-explorer/types/SettingsLogsSeverity';
import { type SettingsLogsSourceId } from '@/settings/log-explorer/types/SettingsLogsSourceId';
import {
  type EventLogRecord,
  type EventLogTable,
} from '~/generated-metadata/graphql';

export type SettingsLogsSource = {
  id: SettingsLogsSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  table: EventLogTable;
  requiresAuditLogs: boolean;
  columns: SettingsLogsColumn[];
  getCountLabel: (input: { count: number; formattedCount: string }) => string;
  getSeverity?: (entry: EventLogRecord) => SettingsLogsSeverity | undefined;
};
