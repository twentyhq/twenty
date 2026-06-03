import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/components/SettingsPageContainer';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { EventLogFilters } from '@/settings/event-logs/components/EventLogFilters';
import { EventLogResultsTable } from '@/settings/event-logs/components/EventLogResultsTable';
import { EventLogTableSelector } from '@/settings/event-logs/components/EventLogTableSelector';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { type EventLogFiltersState } from '@/settings/event-logs/types/EventLogFiltersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { EventLogTable } from '~/generated-metadata/graphql';

const StyledContent = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  min-height: 0;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]}
    ${themeCssVariables.spacing[8]};
  width: 100%;
`;

// Filter card keeps the standard settings content width; the results table
// below is full-width.
const StyledFilterCard = styled.div`
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  width: 100%;
`;

const StyledCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSelectorRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSelectorGrow = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledTableSection = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledRecordCount = styled.span`
  align-self: flex-end;
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTableWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const RECORDS_PER_PAGE = 100;

export const SettingsLogs = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const hasEnterpriseAccess =
    currentWorkspace?.hasValidSignedEnterpriseKey === true;

  const [selectedTable, setSelectedTable] = useState<EventLogTable>(
    EventLogTable.PAGEVIEW,
  );
  const [filters, setFilters] = useState<EventLogFiltersState>({});

  const isApplicationLog = selectedTable === EventLogTable.APPLICATION_LOG;
  const canQuery =
    isClickHouseConfigured && (isApplicationLog || hasEnterpriseAccess);

  const {
    records,
    totalCount,
    hasNextPage,
    loading,
    error,
    refetch,
    loadMore,
  } = useEventLogs(
    {
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
    },
    { skip: !canQuery },
  );

  const handleTableChange = (table: EventLogTable) => {
    setSelectedTable(table);
    setFilters({});
  };

  const handleFiltersChange = (newFilters: EventLogFiltersState) => {
    setFilters(newFilters);
  };

  const renderBelowCard = () => {
    if (!isApplicationLog && !hasEnterpriseAccess) {
      return (
        <StyledFilterCard>
          <SettingsEnterpriseFeatureGateCard
            title={t`Enterprise feature`}
            description={t`Upgrade to Enterprise to access this log type.`}
            buttonTitle={t`Activate`}
          />
        </StyledFilterCard>
      );
    }

    if (!isClickHouseConfigured) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Audit logs require ClickHouse to be configured. Please contact your administrator.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (isDefined(error)) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Something went wrong while loading audit logs. Please try again.`}
        </SettingsEmptyPlaceholder>
      );
    }

    return (
      <StyledTableSection>
        <StyledRecordCount>{t`${records.length} of ${totalCount}`}</StyledRecordCount>
        <StyledTableWrapper>
          <EventLogResultsTable
            records={records}
            loading={loading}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            selectedTable={selectedTable}
          />
        </StyledTableWrapper>
      </StyledTableSection>
    );
  };

  return (
    <StyledContent>
      <StyledFilterCard>
        <Card rounded fullWidth>
          <StyledCardContent>
            <StyledSelectorRow>
              <StyledSelectorGrow>
                <EventLogTableSelector
                  value={selectedTable}
                  onChange={handleTableChange}
                />
              </StyledSelectorGrow>
              <IconButton
                Icon={IconRefresh}
                variant="secondary"
                size="medium"
                ariaLabel={t`Refresh`}
                onClick={() => refetch()}
              />
            </StyledSelectorRow>
            <EventLogFilters
              table={selectedTable}
              value={filters}
              onChange={handleFiltersChange}
            />
          </StyledCardContent>
        </Card>
      </StyledFilterCard>

      {renderBelowCard()}
    </StyledContent>
  );
};
