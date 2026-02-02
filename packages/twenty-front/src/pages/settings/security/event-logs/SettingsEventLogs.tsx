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

const RECORDS_PER_PAGE = 100;

export const SettingsEventLogs = () => {
  const navigateSettings = useNavigateSettings();
  const [selectedTable, setSelectedTable] = useState<EventLogTable>(
    EventLogTable.PAGEVIEW,
  );
  const [filters, setFilters] = useState<EventLogFiltersState>({});

  const { records, totalCount, hasNextPage, loading, refetch, loadMore } =
    useQueryEventLogs({
      table: selectedTable,
      filters: {
        eventType: filters.eventType,
        workspaceMemberId: filters.workspaceMemberId,
        dateRange: filters.dateRange,
        recordId: filters.recordId,
        objectMetadataId: filters.objectMetadataId,
      },
      limit: RECORDS_PER_PAGE,
    });

  const handleTableChange = (table: EventLogTable) => {
    setSelectedTable(table);
    setFilters({});
  };

  const handleFiltersChange = (newFilters: EventLogFiltersState) => {
    setFilters(newFilters);
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
            totalCount={totalCount}
            onLoadMore={loadMore}
            onRefresh={refetch}
            selectedTable={selectedTable}
          />
        </StyledTableContainer>
      </StyledContainer>
    </FullScreenContainer>
  );
};
