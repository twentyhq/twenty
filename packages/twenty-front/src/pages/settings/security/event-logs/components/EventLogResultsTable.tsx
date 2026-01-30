import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useRef, useState } from 'react';

import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { Button } from 'twenty-ui/input';
import {
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from 'twenty-ui/display';

import { EventLogRecord, EventLogTable } from '../types';

import { EventLogJsonCell } from './EventLogJsonCell';

type EventLogResultsTableProps = {
  records: EventLogRecord[];
  loading: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRefresh: () => void;
  selectedTable: EventLogTable;
};

const StyledTableContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
`;

const StyledThead = styled.thead`
  background-color: ${({ theme }) => theme.background.tertiary};
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  min-width: 80px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
  position: relative;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledResizeHandle = styled.div`
  background: transparent;
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;

  &:hover {
    background: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  max-width: 200px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPropertiesTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
  word-break: break-word;
`;

const StyledTr = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledPaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  background-color: ${({ theme }) => theme.background.secondary};
`;

const StyledPaginationInfo = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPaginationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoadingTd = styled.td`
  color: ${({ theme }) => theme.font.color.secondary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledEmptyTd = styled.td`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledRefreshButton = styled.div`
  display: flex;
  align-items: center;
`;

export const EventLogResultsTable = ({
  records,
  loading,
  hasNextPage,
  hasPreviousPage,
  totalCount,
  onNextPage,
  onPreviousPage,
  onRefresh,
  selectedTable,
}: EventLogResultsTableProps) => {
  const { t } = useLingui();
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    event: 200,
    timestamp: 150,
    userId: 150,
    recordId: 150,
    objectId: 150,
  });
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (column: string, event: React.MouseEvent) => {
      event.preventDefault();
      const th = (event.target as HTMLElement).parentElement;

      if (!th) return;

      const startWidth = th.offsetWidth;

      resizingRef.current = {
        column,
        startX: event.clientX,
        startWidth,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;

        const diff = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(80, resizingRef.current.startWidth + diff);

        setColumnWidths((prev) => ({
          ...prev,
          [resizingRef.current!.column]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [],
  );

  const showObjectEventColumns = selectedTable === EventLogTable.OBJECT_EVENT;

  const columnCount = showObjectEventColumns ? 6 : 4;

  return (
    <StyledTableContainer>
      <StyledTable>
        <StyledThead>
          <tr>
            <StyledTh style={{ width: columnWidths['event'] }}>
              <Trans>Event</Trans>
              <StyledResizeHandle
                onMouseDown={(e) => handleResizeStart('event', e)}
              />
            </StyledTh>
            <StyledTh style={{ width: columnWidths['timestamp'] }}>
              <Trans>Timestamp</Trans>
              <StyledResizeHandle
                onMouseDown={(e) => handleResizeStart('timestamp', e)}
              />
            </StyledTh>
            <StyledTh style={{ width: columnWidths['userId'] }}>
              <Trans>User ID</Trans>
              <StyledResizeHandle
                onMouseDown={(e) => handleResizeStart('userId', e)}
              />
            </StyledTh>
            {showObjectEventColumns && (
              <>
                <StyledTh style={{ width: columnWidths['recordId'] }}>
                  <Trans>Record ID</Trans>
                  <StyledResizeHandle
                    onMouseDown={(e) => handleResizeStart('recordId', e)}
                  />
                </StyledTh>
                <StyledTh style={{ width: columnWidths['objectId'] }}>
                  <Trans>Object ID</Trans>
                  <StyledResizeHandle
                    onMouseDown={(e) => handleResizeStart('objectId', e)}
                  />
                </StyledTh>
              </>
            )}
            <StyledTh style={{ width: columnWidths['properties'] }}>
              <Trans>Properties</Trans>
            </StyledTh>
          </tr>
        </StyledThead>
        <tbody>
          {loading && (
            <tr>
              <StyledLoadingTd colSpan={columnCount}>
                <Trans>Loading...</Trans>
              </StyledLoadingTd>
            </tr>
          )}
          {!loading && records.length === 0 && (
            <tr>
              <StyledEmptyTd colSpan={columnCount}>
                <Trans>No event logs found</Trans>
              </StyledEmptyTd>
            </tr>
          )}
          {!loading &&
            records.map((record, index) => (
              <StyledTr key={`${record.timestamp}-${record.event}-${index}`}>
                <StyledTd>{record.event}</StyledTd>
                <StyledTd>
                  {beautifyPastDateRelativeToNow(record.timestamp)}
                </StyledTd>
                <StyledTd>{record.userId ?? '-'}</StyledTd>
                {showObjectEventColumns && (
                  <>
                    <StyledTd>{record.recordId ?? '-'}</StyledTd>
                    <StyledTd>{record.objectMetadataId ?? '-'}</StyledTd>
                  </>
                )}
                <StyledPropertiesTd>
                  <EventLogJsonCell value={record.properties} />
                </StyledPropertiesTd>
              </StyledTr>
            ))}
        </tbody>
      </StyledTable>
      <StyledPaginationContainer>
        <StyledPaginationInfo>
          {t`Total: ${totalCount} records`}
        </StyledPaginationInfo>
        <StyledPaginationButtons>
          <StyledRefreshButton>
            <Button
              Icon={IconRefresh}
              variant="tertiary"
              size="small"
              onClick={onRefresh}
              title={t`Refresh`}
            />
          </StyledRefreshButton>
          <Button
            Icon={IconChevronLeft}
            variant="secondary"
            size="small"
            disabled={!hasPreviousPage}
            onClick={onPreviousPage}
            title={t`Previous page`}
          />
          <Button
            Icon={IconChevronRight}
            variant="secondary"
            size="small"
            disabled={!hasNextPage}
            onClick={onNextPage}
            title={t`Next page`}
          />
        </StyledPaginationButtons>
      </StyledPaginationContainer>
    </StyledTableContainer>
  );
};
