import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';

import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

import {
  type EventLogRecord,
  EventLogTable,
} from '~/pages/settings/security/event-logs/types';

import { EventLogJsonCell } from './EventLogJsonCell';

type EventLogResultsTableProps = {
  records: EventLogRecord[];
  loading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  selectedTable: EventLogTable;
};

const StyledTableContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledScrollContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const StyledTable = styled(Table)`
  min-width: 100%;
`;

const StyledTableBody = styled(TableBody)`
  padding: 0;
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledSkeletonContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
`;

const GRID_COLUMNS_DEFAULT = '2fr 1fr 1fr 3fr';
const GRID_COLUMNS_OBJECT_EVENT = '2fr 1fr 1fr 1fr 1fr 2fr';
const SKELETON_ROW_COUNT = 5;

export const EventLogResultsTable = ({
  records,
  loading,
  hasNextPage,
  onLoadMore,
  selectedTable,
}: EventLogResultsTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showObjectEventColumns = selectedTable === EventLogTable.OBJECT_EVENT;
  const gridColumns = showObjectEventColumns
    ? GRID_COLUMNS_OBJECT_EVENT
    : GRID_COLUMNS_DEFAULT;

  const isInitialLoading = loading && records.length === 0;
  const isLoadingMore = loading && records.length > 0;

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container || loading || !hasNextPage) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      onLoadMore();
    }
  }, [loading, hasNextPage, onLoadMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (isInitialLoading) {
    return (
      <StyledTableContainer>
        <StyledScrollContainer>
          <StyledTable>
            <TableRow gridAutoColumns={gridColumns}>
              <TableHeader>
                <Trans>Event</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>Timestamp</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>User ID</Trans>
              </TableHeader>
              {showObjectEventColumns && (
                <>
                  <TableHeader>
                    <Trans>Record ID</Trans>
                  </TableHeader>
                  <TableHeader>
                    <Trans>Object ID</Trans>
                  </TableHeader>
                </>
              )}
              <TableHeader>
                <Trans>Properties</Trans>
              </TableHeader>
            </TableRow>
          </StyledTable>
          <StyledSkeletonContainer>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
              <Skeleton height={48} borderRadius={4} key={index} />
            ))}
          </StyledSkeletonContainer>
        </StyledScrollContainer>
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer>
      <StyledScrollContainer ref={scrollContainerRef}>
        <StyledTable>
          <TableRow gridAutoColumns={gridColumns}>
            <TableHeader>
              <Trans>Event</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Timestamp</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>User ID</Trans>
            </TableHeader>
            {showObjectEventColumns && (
              <>
                <TableHeader>
                  <Trans>Record ID</Trans>
                </TableHeader>
                <TableHeader>
                  <Trans>Object ID</Trans>
                </TableHeader>
              </>
            )}
            <TableHeader>
              <Trans>Properties</Trans>
            </TableHeader>
          </TableRow>
          <StyledTableBody>
            {records.map((record, index) => (
              <TableRow
                key={`${record.timestamp}-${record.event}-${index}`}
                gridAutoColumns={gridColumns}
              >
                <TableCell>{record.event}</TableCell>
                <TableCell>
                  {beautifyPastDateRelativeToNow(record.timestamp)}
                </TableCell>
                <TableCell>{record.userId ?? '-'}</TableCell>
                {showObjectEventColumns && (
                  <>
                    <TableCell>{record.recordId ?? '-'}</TableCell>
                    <TableCell>{record.objectMetadataId ?? '-'}</TableCell>
                  </>
                )}
                <TableCell>
                  <EventLogJsonCell value={record.properties} />
                </TableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </StyledTable>
        {isLoadingMore && (
          <StyledSkeletonContainer>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height={48} borderRadius={4} key={index} />
            ))}
          </StyledSkeletonContainer>
        )}
        {!loading && records.length === 0 && (
          <StyledEmptyState>
            <Trans>No event logs found</Trans>
          </StyledEmptyState>
        )}
      </StyledScrollContainer>
    </StyledTableContainer>
  );
};
