import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

import {
  type EventLogRecord,
  EventLogTable,
} from '~/pages/settings/security/event-logs/types';

import { type MessageDescriptor } from '@lingui/core';

import { EventLogJsonCell } from './EventLogJsonCell';

type EventLogResultsTableProps = {
  records: EventLogRecord[];
  loading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  selectedTable: EventLogTable;
};

type ColumnConfig = {
  id: string;
  label: MessageDescriptor;
  minWidth: number;
  defaultWidth: number;
};

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'event', label: msg`Event`, minWidth: 100, defaultWidth: 200 },
  { id: 'timestamp', label: msg`Timestamp`, minWidth: 100, defaultWidth: 150 },
  { id: 'userId', label: msg`User ID`, minWidth: 100, defaultWidth: 150 },
  {
    id: 'properties',
    label: msg`Properties`,
    minWidth: 200,
    defaultWidth: 400,
  },
];

const OBJECT_EVENT_COLUMNS: ColumnConfig[] = [
  { id: 'event', label: msg`Event`, minWidth: 100, defaultWidth: 180 },
  { id: 'timestamp', label: msg`Timestamp`, minWidth: 100, defaultWidth: 130 },
  { id: 'userId', label: msg`User ID`, minWidth: 100, defaultWidth: 130 },
  { id: 'recordId', label: msg`Record ID`, minWidth: 100, defaultWidth: 130 },
  {
    id: 'objectMetadataId',
    label: msg`Object ID`,
    minWidth: 100,
    defaultWidth: 130,
  },
  {
    id: 'properties',
    label: msg`Properties`,
    minWidth: 150,
    defaultWidth: 300,
  },
];

const StyledScrollContainer = styled.div`
  height: 100%;
  overflow: auto;
`;

const StyledTable = styled(Table)`
  border-collapse: collapse;
  min-width: 100%;
  table-layout: fixed;
`;

const StyledHeaderRow = styled(TableRow)<{ gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`;

const StyledDataRow = styled(TableRow)<{ gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`;

const StyledResizableHeader = styled(TableHeader)<{ isResizing?: boolean }>`
  position: relative;
  user-select: ${({ isResizing }) => (isResizing ? 'none' : 'auto')};
`;

const StyledResizeHandle = styled.div<{ isResizing: boolean }>`
  background: ${({ isResizing, theme }) =>
    isResizing ? theme.color.blue : 'transparent'};
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;

  &:hover {
    background: ${({ theme }) => theme.color.blue};
  }
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  & > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoadingMore = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledSkeletonContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledIntersectionObserver = styled.div`
  height: 1px;
`;

const SKELETON_ROW_COUNT = 8;

const buildGridTemplateColumns = (
  columns: ColumnConfig[],
  widths: Record<string, number>,
): string => {
  return columns
    .map((col, index) => {
      const isLastColumn = index === columns.length - 1;
      const width = widths[col.id] ?? col.defaultWidth;

      // eslint-disable-next-line lingui/no-unlocalized-strings
      return isLastColumn ? `minmax(${width}px, 1fr)` : `${width}px`;
    })
    .join(' ');
};

export const EventLogResultsTable = ({
  records,
  loading,
  hasNextPage,
  onLoadMore,
  selectedTable,
}: EventLogResultsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const showObjectEventColumns = selectedTable === EventLogTable.OBJECT_EVENT;
  const baseColumns = showObjectEventColumns
    ? OBJECT_EVENT_COLUMNS
    : DEFAULT_COLUMNS;

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(baseColumns.map((col) => [col.id, col.defaultWidth])),
  );

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  const handleResizeStart = useCallback(
    (columnId: string, event: React.PointerEvent) => {
      event.preventDefault();
      setResizingColumn(columnId);
      const startX = event.clientX;
      const startWidth = columnWidths[columnId];

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        const column = baseColumns.find((col) => col.id === columnId);
        const newWidth = Math.max(column?.minWidth ?? 50, startWidth + delta);

        setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }));
      };

      const handlePointerUp = () => {
        setResizingColumn(null);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [columnWidths, baseColumns],
  );

  const gridTemplateColumns = buildGridTemplateColumns(
    baseColumns,
    columnWidths,
  );

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        onLoadMore();
      }
    },
  });

  const isInitialLoading = loading && records.length === 0;

  if (isInitialLoading) {
    return (
      <StyledScrollContainer>
        <StyledTable>
          <StyledHeaderRow gridTemplateColumns={gridTemplateColumns}>
            {baseColumns.map((column) => (
              <TableHeader key={column.id}>{t(column.label)}</TableHeader>
            ))}
          </StyledHeaderRow>
        </StyledTable>
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          <StyledSkeletonContainer>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
              <Skeleton height={40} key={index} style={{ marginBottom: 4 }} />
            ))}
          </StyledSkeletonContainer>
        </SkeletonTheme>
      </StyledScrollContainer>
    );
  }

  if (!loading && records.length === 0) {
    return (
      <StyledEmptyState>
        <Trans>No event logs found</Trans>
      </StyledEmptyState>
    );
  }

  return (
    <StyledScrollContainer>
      <StyledTable>
        <StyledHeaderRow gridTemplateColumns={gridTemplateColumns}>
          {baseColumns.map((column) => (
            <StyledResizableHeader
              key={column.id}
              isResizing={resizingColumn === column.id}
            >
              {t(column.label)}
              <StyledResizeHandle
                isResizing={resizingColumn === column.id}
                onPointerDown={(event) => handleResizeStart(column.id, event)}
              />
            </StyledResizableHeader>
          ))}
        </StyledHeaderRow>
        {records.map((record, index) => (
          <StyledDataRow
            key={`${record.timestamp}-${record.event}-${index}`}
            gridTemplateColumns={gridTemplateColumns}
          >
            <StyledTableCell>{record.event}</StyledTableCell>
            <StyledTableCell>
              {beautifyPastDateRelativeToNow(record.timestamp)}
            </StyledTableCell>
            <StyledTableCell>{record.userId ?? '-'}</StyledTableCell>
            {showObjectEventColumns && (
              <>
                <StyledTableCell>{record.recordId ?? '-'}</StyledTableCell>
                <StyledTableCell>
                  {record.objectMetadataId ?? '-'}
                </StyledTableCell>
              </>
            )}
            <StyledTableCell>
              <EventLogJsonCell value={record.properties} />
            </StyledTableCell>
          </StyledDataRow>
        ))}
      </StyledTable>
      <StyledIntersectionObserver ref={fetchMoreRef} />
      {loading && records.length > 0 && (
        <StyledLoadingMore>
          <Trans>Loading more...</Trans>
        </StyledLoadingMore>
      )}
    </StyledScrollContainer>
  );
};
