import { type ReactNode } from 'react';
import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { EventLogJsonCell } from '@/settings/event-logs/components/EventLogJsonCell';
import {
  type EventLogRecord,
  EventLogTable,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

export type ColumnConfig = {
  id: string;
  label: MessageDescriptor;
  minWidth: number;
  defaultWidth: number;
  renderCell: (record: EventLogRecord) => ReactNode;
};

const EVENT_COLUMN: ColumnConfig = {
  id: 'event',
  label: msg`Event`,
  minWidth: 100,
  defaultWidth: 200,
  renderCell: (record) => record.event,
};

const TIMESTAMP_COLUMN: ColumnConfig = {
  id: 'timestamp',
  label: msg`Timestamp`,
  minWidth: 100,
  defaultWidth: 150,
  renderCell: (record) => beautifyPastDateRelativeToNow(record.timestamp),
};

const USER_COLUMN: ColumnConfig = {
  id: 'userId',
  label: msg`User`,
  minWidth: 100,
  defaultWidth: 150,
  renderCell: (record) => record.userId ?? '-',
};

const PROPERTIES_COLUMN: ColumnConfig = {
  id: 'properties',
  label: msg`Properties`,
  minWidth: 200,
  defaultWidth: 400,
  renderCell: (record) => <EventLogJsonCell value={record.properties} />,
};

const DEFAULT_COLUMNS: ColumnConfig[] = [
  EVENT_COLUMN,
  TIMESTAMP_COLUMN,
  USER_COLUMN,
  PROPERTIES_COLUMN,
];

const OBJECT_EVENT_COLUMNS: ColumnConfig[] = [
  { ...EVENT_COLUMN, defaultWidth: 180 },
  { ...TIMESTAMP_COLUMN, defaultWidth: 130 },
  { ...USER_COLUMN, defaultWidth: 130 },
  {
    id: 'recordId',
    label: msg`Record ID`,
    minWidth: 100,
    defaultWidth: 130,
    renderCell: (record) => record.recordId ?? '-',
  },
  {
    id: 'objectMetadataId',
    label: msg`Object ID`,
    minWidth: 100,
    defaultWidth: 130,
    renderCell: (record) => record.objectMetadataId ?? '-',
  },
  { ...PROPERTIES_COLUMN, minWidth: 150, defaultWidth: 300 },
];

const USAGE_EVENT_COLUMNS: ColumnConfig[] = [
  { ...EVENT_COLUMN, label: msg`Resource Type`, defaultWidth: 130 },
  { ...TIMESTAMP_COLUMN, defaultWidth: 140 },
  { ...USER_COLUMN, defaultWidth: 130 },
  { ...PROPERTIES_COLUMN, label: msg`Details` },
];

const APPLICATION_LOG_COLUMNS: ColumnConfig[] = [
  { ...EVENT_COLUMN, label: msg`Function`, defaultWidth: 160 },
  { ...TIMESTAMP_COLUMN, defaultWidth: 140 },
  {
    id: 'level',
    label: msg`Level`,
    minWidth: 60,
    defaultWidth: 80,
    renderCell: (record) => record.properties?.level ?? '-',
  },
  {
    id: 'message',
    label: msg`Message`,
    minWidth: 200,
    defaultWidth: 400,
    renderCell: (record) => record.properties?.message ?? '-',
  },
  {
    id: 'executionId',
    label: msg`Execution ID`,
    minWidth: 100,
    defaultWidth: 140,
    renderCell: (record) => record.properties?.executionId ?? '-',
  },
];

const COLUMNS_BY_TABLE: Record<EventLogTable, ColumnConfig[]> = {
  [EventLogTable.OBJECT_EVENT]: OBJECT_EVENT_COLUMNS,
  [EventLogTable.USAGE_EVENT]: USAGE_EVENT_COLUMNS,
  [EventLogTable.APPLICATION_LOG]: APPLICATION_LOG_COLUMNS,
  [EventLogTable.WORKSPACE_EVENT]: DEFAULT_COLUMNS,
  [EventLogTable.PAGEVIEW]: DEFAULT_COLUMNS,
};

export const getColumnsForEventLogTable = (
  table: EventLogTable,
): ColumnConfig[] => {
  return COLUMNS_BY_TABLE[table] ?? DEFAULT_COLUMNS;
};
