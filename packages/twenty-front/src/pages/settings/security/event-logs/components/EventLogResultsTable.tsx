import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef } from 'react';

import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

import {
  type EventLogRecord,
  EventLogTable,
} from '~/pages/settings/security/event-logs/types';

import { EventLogJsonCell } from './EventLogJsonCell';

type EventLogResultsTableProps = {
  records: EventLogRecord[];
  loading: boolean;
  hasNextPage: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onRefresh: () => void;
  selectedTable: EventLogTable;
};

const StyledTableContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
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

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
`;

const StyledFooterInfo = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoadingState = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const GRID_COLUMNS_DEFAULT = '2fr 1fr 1fr 3fr';
const GRID_COLUMNS_OBJECT_EVENT = '2fr 1fr 1fr 1fr 1fr 2fr';

export const EventLogResultsTable = ({
  records,
  loading,
  hasNextPage,
  totalCount,
  onLoadMore,
  onRefresh,
  selectedTable,
}: EventLogResultsTableProps) => {
  const { t } = useLingui();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const recordCount = records.length;
  const showObjectEventColumns = selectedTable === EventLogTable.OBJECT_EVENT;
  const gridColumns = showObjectEventColumns
    ? GRID_COLUMNS_OBJECT_EVENT
    : GRID_COLUMNS_DEFAULT;

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
        {loading && (
          <StyledLoadingState>
            <Trans>Loading...</Trans>
          </StyledLoadingState>
        )}
        {!loading && records.length === 0 && (
          <StyledEmptyState>
            <Trans>No event logs found</Trans>
          </StyledEmptyState>
        )}
      </StyledScrollContainer>
      <StyledFooter>
        <StyledFooterInfo>
          {t`${recordCount} of ${totalCount} records`}
        </StyledFooterInfo>
        <Button
          Icon={IconRefresh}
          variant="tertiary"
          size="small"
          onClick={onRefresh}
          title={t`Refresh`}
        />
      </StyledFooter>
    </StyledTableContainer>
  );
};
