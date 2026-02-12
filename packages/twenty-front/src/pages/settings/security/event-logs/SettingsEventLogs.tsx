import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { EventLogTable } from '~/generated-metadata/graphql';

import { EventLogFilters } from './components/EventLogFilters';
import { EventLogResultsTable } from './components/EventLogResultsTable';
import { EventLogTableSelector } from './components/EventLogTableSelector';
import { useEventLogs } from './hooks/useQueryEventLogs';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledRecordCount = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTableWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const StyledErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledErrorIcon = styled.div`
  color: ${({ theme }) => theme.color.orange};
`;

const StyledErrorTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledErrorMessage = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  max-width: 400px;
`;

export type EventLogFiltersState = {
  eventType?: string;
  userWorkspaceId?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recordId?: string;
  objectMetadataId?: string;
};

const RECORDS_PER_PAGE = 100;

export const SettingsEventLogs = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const [selectedTable, setSelectedTable] = useState<EventLogTable>(
    EventLogTable.PAGEVIEW,
  );
  const [filters, setFilters] = useState<EventLogFiltersState>({});

  const {
    records,
    totalCount,
    hasNextPage,
    loading,
    error,
    refetch,
    loadMore,
  } = useEventLogs({
    table: selectedTable,
    filters: {
      eventType: filters.eventType,
      userWorkspaceId: filters.userWorkspaceId,
      dateRange: filters.dateRange
        ? {
            start: filters.dateRange.start?.toISOString(),
            end: filters.dateRange.end?.toISOString(),
          }
        : undefined,
      recordId: filters.recordId,
      objectMetadataId: filters.objectMetadataId,
    },
    first: RECORDS_PER_PAGE,
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

  const recordCount = records.length;

  const getErrorContent = () => {
    if (!isDefined(error)) {
      return null;
    }

    const errorMessage = error.message || '';
    const isClickHouseError = errorMessage.includes('ClickHouse');
    const isEntitlementError =
      errorMessage.includes('Enterprise') ||
      errorMessage.includes('entitlement');

    if (isClickHouseError) {
      return {
        title: t`ClickHouse Not Configured`,
        message: t`Audit logs require ClickHouse to be configured. Please contact your administrator to set up ClickHouse.`,
      };
    }

    if (isEntitlementError) {
      return {
        title: t`Enterprise Feature`,
        message: t`Audit logs are available with an Enterprise subscription. Please upgrade to access this feature.`,
      };
    }

    return {
      title: t`Error Loading Audit Logs`,
      message:
        errorMessage || t`An unexpected error occurred. Please try again.`,
    };
  };

  const errorContent = getErrorContent();

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
        { children: <Trans>Audit Logs</Trans> },
      ]}
    >
      <StyledContainer>
        {isDefined(errorContent) ? (
          <StyledErrorContainer>
            <StyledErrorIcon>
              <IconAlertTriangle size={48} />
            </StyledErrorIcon>
            <StyledErrorTitle>{errorContent.title}</StyledErrorTitle>
            <StyledErrorMessage>{errorContent.message}</StyledErrorMessage>
            <Button
              title={t`Go Back`}
              variant="secondary"
              onClick={handleExitFullScreen}
            />
          </StyledErrorContainer>
        ) : (
          <>
            <StyledHeader>
              <EventLogTableSelector
                value={selectedTable}
                onChange={handleTableChange}
              />
              <EventLogFilters
                table={selectedTable}
                value={filters}
                onChange={handleFiltersChange}
              />
              <StyledHeaderRow>
                <StyledRecordCount>
                  {t`${recordCount} of ${totalCount} records`}
                </StyledRecordCount>
                <Button
                  Icon={IconRefresh}
                  variant="tertiary"
                  size="small"
                  onClick={() => refetch()}
                  title={t`Refresh`}
                />
              </StyledHeaderRow>
            </StyledHeader>
            <StyledTableWrapper>
              <EventLogResultsTable
                records={records}
                loading={loading}
                hasNextPage={hasNextPage}
                onLoadMore={loadMore}
                selectedTable={selectedTable}
              />
            </StyledTableWrapper>
          </>
        )}
      </StyledContainer>
    </FullScreenContainer>
  );
};
