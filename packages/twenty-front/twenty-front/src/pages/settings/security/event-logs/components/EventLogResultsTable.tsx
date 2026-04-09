import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

import { type MessageDescriptor } from '@lingui/core';

import {
  type EventLogRecord,
  EventLogTable,
} from '~/generated-metadata/graphql';

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
  {
    id: 'userId',
    label: msg`User`,
    minWidth: 100,
    defaultWidth: 150,
  },
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
  {
    id: 'userId',
    label: msg`User`,
    minWidth: 100,
    defaultWidth: 130,
  },
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

const USAGE_EVENT_COLUMNS: ColumnConfig[] = [
  {
    id: 'event',
    label: msg`Resource Type`,
    minWidth: 100,
    defaultWidth: 130,
  },
  {
    id: 'timestamp',
    label: msg`Timestamp`,
    minWidth: 100,
    defaultWidth: 140,
  },
  { id: 'userId', label: msg`User`, minWidth: 100, defaultWidth: 130 },
  {
    id: 'properties',
    label: msg`Details`,
    minWidth: 200,
    defaultWidth: 400,
  },
];

const StyledScrollWrapperContainer = styled.div`
  height: 100%;
  overflow: hidden;
`;

const StyledTableContainer = styled.div`
  > div {
    min-width: 100%;
  }
`;

const StyledResizableHeaderContainer = styled.div<{ isResizing?: boolean }>`
  position: relative;
  user-select: ${({ isResizing }) => (isResizing ? 'none' : 'auto')};
`;

const StyledResizeHandle = styled.div<{ isResizing: boolean }>`
  background: ${({ isResizing }) =>
    isResizing ? themeCssVariables.color.blue : 'transparent'};
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;

  &:hover {
    background: ${themeCssVariables.color.blue};
  }
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const StyledLoadingMore = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledSkeletonContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledIntersectionObserver = styled.div`
  height: 1px;
`;

const SKELETON_ROW_COUNT = 8;
const EVENT_LOG_SCROLL_WRAPPER_INSTANCE_ID = 'event-log-results-table';

const buildGridTemplateColumns = (
  columns: ColumnConfig[],
  widths: Record<string, number>,
): string => {
  return columns
    .map((col, index) => {
      const isLastColumn = index === columns.length - 1;
      const width = widths[col.id] ?? col.defaultWidth;

      // oxlint-disable-next-line lingui/no-unlocalized-strings
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
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const showObjectEventColumns = selectedTable === EventLogTable.OBJECT_EVENT;
  const baseColumns =
    selectedTable === EventLogTable.OBJECT_EVENT
      ? OBJECT_EVENT_COLUMNS
      : selectedTable === EventLogTable.USAGE_EVENT
        ? USAGE_EVENT_COLUMNS
        : DEFAULT_COLUMNS;

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(baseColumns.map((col) => [col.id, col.defaultWidth])),
  );

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // Reset column widths when switching tables to avoid undefined widths for new columns
  useEffect(() => {
    setColumnWidths(
      Object.fromEntries(baseColumns.map((col) => [col.id, col.defaultWidth])),
    );
  }, [selectedTable, baseColumns]);

  const handleResizeStart = useCallback(
    (columnId: string, event: React.PointerEvent) => {
      event.preventDefault();
      setResizingColumn(columnId);
      const startX = event.clientX;
      const column = baseColumns.find((col) => col.id === columnId);
      const startWidth = columnWidths[columnId] ?? column?.defaultWidth ?? 100;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
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

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement(
    EVENT_LOG_SCROLL_WRAPPER_INSTANCE_ID,
  );

  const [shouldFetchMore, setShouldFetchMore] = useState(false);

  const { ref: fetchMoreRef, inView } = useInView({
    root: scrollWrapperHTMLElement,
    rootMargin: '400px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !loading && !shouldFetchMore) {
      setShouldFetchMore(true);
      onLoadMore();
    }
  }, [inView, hasNextPage, loading, shouldFetchMore, onLoadMore]);

  useEffect(() => {
    if (!loading) {
      setShouldFetchMore(false);
    }
  }, [loading]);

  const isInitialLoading = loading && records.length === 0;

  if (isInitialLoading) {
    return (
      <StyledScrollWrapperContainer>
        <ScrollWrapper
          componentInstanceId={EVENT_LOG_SCROLL_WRAPPER_INSTANCE_ID}
        >
          <StyledTableContainer>
            <Table>
              <TableRow gridTemplateColumns={gridTemplateColumns}>
                {baseColumns.map((column) => (
                  <TableHeader key={column.id}>{t(column.label)}</TableHeader>
                ))}
              </TableRow>
            </Table>
          </StyledTableContainer>
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
        </ScrollWrapper>
      </StyledScrollWrapperContainer>
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
    <StyledScrollWrapperContainer>
      <ScrollWrapper componentInstanceId={EVENT_LOG_SCROLL_WRAPPER_INSTANCE_ID}>
        <StyledTableContainer>
          <Table>
            <TableRow gridTemplateColumns={gridTemplateColumns}>
              {baseColumns.map((column) => (
                <StyledResizableHeaderContainer
                  key={column.id}
                  isResizing={resizingColumn === column.id}
                >
                  <TableHeader>{t(column.label)}</TableHeader>
                  <StyledResizeHandle
                    isResizing={resizingColumn === column.id}
                    onPointerDown={(event) =>
                      handleResizeStart(column.id, event)
                    }
                  />
                </StyledResizableHeaderContainer>
              ))}
            </TableRow>
            {records.map((record, index) => (
              <TableRow
                key={`${record.timestamp}-${record.event}-${index}`}
                gridTemplateColumns={gridTemplateColumns}
              >
                <TableCell
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {record.event}
                </TableCell>
                <TableCell
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {beautifyPastDateRelativeToNow(record.timestamp)}
                </TableCell>
                <TableCell
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {record.userId ?? '-'}
                </TableCell>
                {showObjectEventColumns && (
                  <>
                    <TableCell
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {record.recordId ?? '-'}
                    </TableCell>
                    <TableCell
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {record.objectMetadataId ?? '-'}
                    </TableCell>
                  </>
                )}
                <TableCell
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  <EventLogJsonCell value={record.properties} />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </StyledTableContainer>
        <StyledIntersectionObserver ref={fetchMoreRef} />
        {loading && records.length > 0 && (
          <StyledLoadingMore>
            <Trans>Loading more...</Trans>
          </StyledLoadingMore>
        )}
      </ScrollWrapper>
    </StyledScrollWrapperContainer>
  );
};
