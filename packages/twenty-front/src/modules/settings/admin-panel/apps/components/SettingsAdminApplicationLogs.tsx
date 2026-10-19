import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebounce } from 'use-debounce';

import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminApplicationLogDetail } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationLogDetail';
import { ADMIN_APPLICATION_LOG_LEVEL_FILTERS } from '@/settings/admin-panel/apps/constants/AdminApplicationLogLevelFilters';
import { ADMIN_APPLICATION_LOGS_MAXIMUM_PAGE_SIZE } from '@/settings/admin-panel/apps/constants/AdminApplicationLogsMaximumPageSize';
import { ADMIN_APPLICATION_LOGS_PAGE_SIZE } from '@/settings/admin-panel/apps/constants/AdminApplicationLogsPageSize';
import { ADMIN_APPLICATION_LOGS_POLL_INTERVAL_MS } from '@/settings/admin-panel/apps/constants/AdminApplicationLogsPollIntervalMs';
import { type AdminApplicationLogLevelFilter } from '@/settings/admin-panel/apps/types/AdminApplicationLogLevelFilter';
import { getAdminApplicationLogLevels } from '@/settings/admin-panel/apps/utils/getAdminApplicationLogLevels';
import { getAdminApplicationMonitoringWorkspaceLabel } from '@/settings/admin-panel/apps/utils/getAdminApplicationMonitoringWorkspaceLabel';
import { getApplicationLogFunctionOrEventLabel } from '@/settings/application-monitoring/utils/getApplicationLogFunctionOrEventLabel';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableTagCell } from '@/settings/components/SettingsTableTagCell';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { FindAdminApplicationRegistrationLogsDocument } from '~/generated-admin/graphql';
import { formatDate } from '~/utils/date-utils';

const LOGS_GRID_TEMPLATE_COLUMNS =
  '128px 104px minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1.4fr)';

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[2]};

  > :first-child {
    flex: 1;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAdminApplicationLogsProps = {
  instanceId: string;
  applicationRegistrationId: string;
  workspaceId?: string;
  periodStart: string;
};

export const SettingsAdminApplicationLogs = ({
  instanceId,
  applicationRegistrationId,
  workspaceId,
  periodStart,
}: SettingsAdminApplicationLogsProps) => {
  const { t, i18n } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const [levelFilter, setLevelFilter] =
    useState<AdminApplicationLogLevelFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [pageSize, setPageSize] = useState(ADMIN_APPLICATION_LOGS_PAGE_SIZE);
  const [expandedLogKey, setExpandedLogKey] = useState<string>();

  const { data, previousData, loading, error } = useQuery(
    FindAdminApplicationRegistrationLogsDocument,
    {
      client: apolloAdminClient,
      variables: {
        input: {
          applicationRegistrationId,
          workspaceId,
          levels: getAdminApplicationLogLevels(levelFilter),
          search: debouncedSearchTerm,
          periodStart,
          first: pageSize,
        },
      },
      pollInterval: ADMIN_APPLICATION_LOGS_POLL_INTERVAL_MS,
    },
  );

  const result = (data ?? previousData)?.findAdminApplicationRegistrationLogs;
  const logs = result?.records ?? [];
  const canShowMore =
    (result?.pageInfo.hasNextPage ?? false) &&
    pageSize < ADMIN_APPLICATION_LOGS_MAXIMUM_PAGE_SIZE;

  const handleLevelFilterChange = (
    nextLevelFilter: AdminApplicationLogLevelFilter,
  ) => {
    setLevelFilter(nextLevelFilter);
    setPageSize(ADMIN_APPLICATION_LOGS_PAGE_SIZE);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPageSize(ADMIN_APPLICATION_LOGS_PAGE_SIZE);
  };

  const handleShowMore = () =>
    setPageSize(
      Math.min(
        pageSize + ADMIN_APPLICATION_LOGS_PAGE_SIZE,
        ADMIN_APPLICATION_LOGS_MAXIMUM_PAGE_SIZE,
      ),
    );

  const renderLogs = () => {
    if (isDefined(error)) {
      return (
        <SettingsEmptyPlaceholder>{t`Couldn't load logs`}</SettingsEmptyPlaceholder>
      );
    }

    if (!isDefined(result)) {
      return loading ? <SettingsSectionSkeletonLoader /> : null;
    }

    if (logs.length === 0) {
      return (
        <SettingsEmptyPlaceholder>{t`No logs in this period`}</SettingsEmptyPlaceholder>
      );
    }

    return (
      <Table>
        <TableRow gridTemplateColumns={LOGS_GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Time`}</TableHeader>
          <TableHeader>{t`Level`}</TableHeader>
          <TableHeader>{t`Workspace`}</TableHeader>
          <TableHeader>{t`Function / event`}</TableHeader>
          <TableHeader>{t`Message`}</TableHeader>
        </TableRow>
        <TableBody>
          {logs.map((log, logIndex) => {
            const logKey = `${log.timestamp}-${logIndex}`;
            const isExpanded = logKey === expandedLogKey;
            const level = LOG_CONSOLE_LEVELS[log.properties?.level];
            const [firstMessageLine] = String(
              log.properties?.message ?? '',
            ).split('\n');

            return (
              <Fragment key={logKey}>
                <TableRow
                  gridTemplateColumns={LOGS_GRID_TEMPLATE_COLUMNS}
                  isClickable
                  isExpanded={isExpanded}
                  onClick={() =>
                    setExpandedLogKey(isExpanded ? undefined : logKey)
                  }
                >
                  <SettingsTableTextCell
                    text={formatDate(log.timestamp, 'MMM d, HH:mm:ss')}
                  />
                  <SettingsTableTagCell>
                    {isDefined(level) && (
                      <Status color={level.color}>{i18n._(level.label)}</Status>
                    )}
                  </SettingsTableTagCell>
                  <SettingsTableTextCell
                    text={getAdminApplicationMonitoringWorkspaceLabel({
                      workspaceId: log.properties?.workspaceId ?? '',
                      workspaceName: log.properties?.workspaceName,
                    })}
                  />
                  <SettingsTableTextCell
                    text={getApplicationLogFunctionOrEventLabel({
                      logicFunctionName: log.event,
                      source: log.properties?.source ?? '',
                    })}
                  />
                  <SettingsTableTextCell text={firstMessageLine} />
                </TableRow>
                {isExpanded && <SettingsAdminApplicationLogDetail log={log} />}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <StyledToolbar>
        <SettingsTextInput
          instanceId={`${instanceId}-search`}
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t`Search messages...`}
          fullWidth
        />
        <Select
          dropdownId={`${instanceId}-level`}
          value={levelFilter}
          options={ADMIN_APPLICATION_LOG_LEVEL_FILTERS.map((filter) => ({
            value: filter.value,
            label: i18n._(filter.label),
          }))}
          onChange={handleLevelFilterChange}
          needIconCheck
        />
      </StyledToolbar>
      {renderLogs()}
      {canShowMore && (
        <StyledButtonContainer>
          <Button
            startIcon={<IconChevronDown />}
            size="sm"
            onClick={handleShowMore}
            variant="outline"
          >{t`Show more`}</Button>
        </StyledButtonContainer>
      )}
    </>
  );
};
