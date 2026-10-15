import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { type LogConsoleDetailField } from '@/log-console/types/LogConsoleDetailField';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';
import { type LogConsoleIdField } from '@/log-console/types/LogConsoleIdField';
import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type EventLogFieldFilterInput,
  type EventLogRecord,
  type EventLogTable,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

type LogConsoleSourceBase = {
  id: LogConsoleSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  requiresAuditLogs: boolean;
  // Any one of these flags opens the source
  requiredPermissionFlags?: PermissionFlagType[];
  filterFields?: LogConsoleFilterField[];
};

export type LogConsoleEventLogSource = LogConsoleSourceBase & {
  DetailIcon?: IconComponent;
  table: EventLogTable;
  fieldFilters?: EventLogFieldFilterInput[];
  columns: LogConsoleColumn[];
  detailFields: LogConsoleDetailField[];
  idFields: LogConsoleIdField[];
  getCountLabel?: (input: { count: number; formattedCount: string }) => string;
  getSeverity?: (entry: EventLogRecord) => LogConsoleSeverity | undefined;
  getDetailTitle: (
    entry: EventLogRecord,
    context: { objectMetadataItem?: EnrichedObjectMetadataItem },
  ) => string;
  renderDetailContent?: (entry: EventLogRecord) => ReactNode;
};

export type LogConsolePanelSource = LogConsoleSourceBase & {
  renderContent: () => ReactNode;
};

export type LogConsoleSource = LogConsoleEventLogSource | LogConsolePanelSource;
