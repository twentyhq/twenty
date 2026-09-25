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
} from '~/generated-metadata/graphql';

export type LogConsoleSource = {
  id: LogConsoleSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  DetailIcon?: IconComponent;
  table: EventLogTable;
  fieldFilters?: EventLogFieldFilterInput[];
  filterFields?: LogConsoleFilterField[];
  requiresAuditLogs: boolean;
  columns: LogConsoleColumn[];
  detailFields: LogConsoleDetailField[];
  idFields: LogConsoleIdField[];
  searchPlaceholder?: MessageDescriptor;
  getCountLabel?: (input: { count: number; formattedCount: string }) => string;
  getSeverity?: (entry: EventLogRecord) => LogConsoleSeverity | undefined;
  getDetailTitle: (
    entry: EventLogRecord,
    context: { objectMetadataItem?: EnrichedObjectMetadataItem },
  ) => string;
  renderDetailContent?: (entry: EventLogRecord) => ReactNode;
};
