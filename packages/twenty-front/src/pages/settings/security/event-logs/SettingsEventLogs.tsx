import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { EventLogFilters } from './components/EventLogFilters';
import { EventLogResultsTable } from './components/EventLogResultsTable';
import { EventLogTableSelector } from './components/EventLogTableSelector';
import { useQueryEventLogs } from './hooks/useQueryEventLogs';
import { EventLogTable } from './types';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledControlsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export type EventLogFiltersState = {
  eventType?: string;
  workspaceMemberId?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recordId?: string;
  objectMetadataId?: string;
};

export const SettingsEventLogs = () => {
  const navigateSettings = useNavigateSettings();
  const [selectedTable, setSelectedTable] = useState<EventLogTable>(
    EventLogTable.PAGEVIEW,
  );
  const [filters, setFilters] = useState<EventLogFiltersState>({});
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { records, totalCount, hasNextPage, loading, refetch } =
    useQueryEventLogs({
      table: selectedTable,
      filters: {
        eventType: filters.eventType,
        workspaceMemberId: filters.workspaceMemberId,
        dateRange: filters.dateRange,
        recordId: filters.recordId,
        objectMetadataId: filters.objectMetadataId,
      },
      limit,
      offset,
    });

  const handleTableChange = (table: EventLogTable) => {
    setSelectedTable(table);
    setFilters({});
    setOffset(0);
  };

  const handleFiltersChange = (newFilters: EventLogFiltersState) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setOffset(offset + limit);
    }
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.Security);
  };

  return (
    <FullScreenContainer
      exitFullScreen={handleExitFullScreen}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Security</Trans>,
          href: getSettingsPath(SettingsPath.Security),
        },
        { children: <Trans>Event Logs</Trans> },
      ]}
    >
      <StyledContainer>
        <StyledControlsRow>
          <EventLogTableSelector
            value={selectedTable}
            onChange={handleTableChange}
          />
          <EventLogFilters
            table={selectedTable}
            value={filters}
            onChange={handleFiltersChange}
          />
        </StyledControlsRow>
        <StyledTableContainer>
          <EventLogResultsTable
            records={records}
            loading={loading}
            hasNextPage={hasNextPage}
            hasPreviousPage={offset > 0}
            totalCount={totalCount}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onRefresh={handleRefresh}
            selectedTable={selectedTable}
          />
        </StyledTableContainer>
      </StyledContainer>
    </FullScreenContainer>
  );
};
