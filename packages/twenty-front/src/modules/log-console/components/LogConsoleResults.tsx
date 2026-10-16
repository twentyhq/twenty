import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import {
  IconEraser,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  LogConsoleActivity,
  type LogConsoleActivitySelection,
} from '@/log-console/components/LogConsoleActivity';
import { LogConsoleTable } from '@/log-console/components/LogConsoleTable';
import { LogConsoleTimeRangeDropdown } from '@/log-console/components/LogConsoleTimeRangeDropdown';
import { LogConsoleToolbar } from '@/log-console/components/LogConsoleToolbar';
import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { getLogConsoleFieldFilters } from '@/log-console/utils/getLogConsoleFieldFilters';
import { getLogConsoleTimeRangeBounds } from '@/log-console/utils/getLogConsoleTimeRangeBounds';
import { getLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/getLogConsoleTimeRangeWithinRetention';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { useEventLogsLiveStream } from '@/settings/event-logs/hooks/useEventLogsLiveStream';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { sortByProperty } from '~/utils/array/sortByProperty';

const RECORDS_PER_PAGE = 100;

const sortNewestFirst = (eventLogRecords: EventLogRecord[]) =>
  eventLogRecords.toSorted(sortByProperty('timestamp')).toReversed();

const StyledResults = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledInstanceControl = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-inline: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { t } = useLingui();
  const timeZone = useLogConsoleTimeZone();
  const { retentionInHours } = useLogConsoleRetention();

  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const [logConsoleTimeRange, setLogConsoleTimeRange] = useAtomState(
    logConsoleTimeRangeState,
  );
  const [logConsoleFilters, setLogConsoleFilters] = useAtomState(
    logConsoleFiltersState,
  );
  const filterContextKey = JSON.stringify({
    source: source.id,
    filters: logConsoleFilters,
  });
  const [instanceLevelContext, setInstanceLevelContext] = useState<string>();
  const [selectedBucket, setSelectedBucket] =
    useState<LogConsoleActivitySelection>();
  const [instanceClearedAt, setInstanceClearedAt] = useState<string>();
  const isInstanceLevel =
    source.id === 'app-logs' && instanceLevelContext === filterContextKey;
  const displayedSource = isInstanceLevel
    ? {
        ...source,
        columns: [
          ...source.columns.slice(0, 1),
          {
            id: 'workspace',
            label: msg`Workspace`,
            gridTrack: '160px',
            renderCell: (entry: EventLogRecord) => (
              <SettingsTableTextCell
                text={
                  entry.properties?.workspaceName ??
                  entry.properties?.workspaceId ??
                  ''
                }
              />
            ),
          },
          ...source.columns.slice(1),
        ],
      }
    : source;
  const [refreshedAt, setRefreshedAt] = useState(() =>
    new Date().toISOString(),
  );
  const [pausedLiveRecords, setPausedLiveRecords] =
    useState<EventLogRecord[]>();
  const [clearedLiveRecordCount, setClearedLiveRecordCount] =
    useState<number>();

  const timeRange = getLogConsoleTimeRangeWithinRetention({
    timeRange: logConsoleTimeRange,
    retentionInHours,
  });

  const fieldFilters = getLogConsoleFieldFilters({
    source,
    filters: logConsoleFilters,
  });

  const getDateRange = (now: string) =>
    getLogConsoleTimeRangeBounds({ timeRange, now, timeZone });

  const getEventLogsInput = (now: string) => ({
    table: source.table,
    first: RECORDS_PER_PAGE,
    instanceLevel: isInstanceLevel,
    filters: {
      dateRange:
        (selectedBucket
          ? {
              ...selectedBucket,
              end: new Date(
                new Date(selectedBucket.end).getTime() - 1,
              ).toISOString(),
            }
          : undefined) ??
        (isInstanceLevel && instanceClearedAt
          ? { ...getDateRange(now), start: instanceClearedAt }
          : getDateRange(now)),
      fieldFilters,
    },
  });

  const dateRange = getDateRange(refreshedAt);

  const isLive = !isDefined(dateRange.end);
  const isPaused = isDefined(pausedLiveRecords);

  const {
    records,
    hasNextPage,
    loading,
    error,
    loadMore,
    refetch,
    canQueryInstanceLevel,
  } = useEventLogs(getEventLogsInput(refreshedAt), {
    pollInterval:
      isInstanceLevel && isLive && !isPaused && !selectedBucket ? 15000 : 0,
  });

  const { liveRecords, clearLiveRecords } = useEventLogsLiveStream({
    table: source.table,
    fieldFilters,
    enabled: isLive && !isInstanceLevel && !selectedBucket,
  });

  const displayedLiveRecords = pausedLiveRecords ?? liveRecords;

  const isCleared = isDefined(clearedLiveRecordCount);

  const liveEntries = sortNewestFirst(
    isCleared
      ? displayedLiveRecords.slice(
          0,
          displayedLiveRecords.length - clearedLiveRecordCount,
        )
      : displayedLiveRecords,
  );

  const displayedEntryCount = records.length + displayedLiveRecords.length;

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID,
  );

  const scrollToTop = () => {
    getScrollWrapperElement().scrollWrapperElement?.scrollTo({ top: 0 });
  };

  const restartLogs = (now: string) => {
    scrollToTop();
    setRefreshedAt(now);
    setLogConsoleSelectedLog(null);
    setInstanceClearedAt(undefined);
    clearLiveRecords();
    setPausedLiveRecords(isPaused ? [] : undefined);
    setClearedLiveRecordCount(undefined);
  };

  const refreshLogs = () => {
    const now = new Date().toISOString();

    restartLogs(now);
    void refetch({ input: getEventLogsInput(now) });
  };

  const clearLogs = () => {
    scrollToTop();
    setPausedLiveRecords(undefined);
    setClearedLiveRecordCount(liveRecords.length);
    if (isInstanceLevel) setInstanceClearedAt(new Date().toISOString());
  };

  const togglePause = () => {
    setPausedLiveRecords(isPaused ? undefined : liveRecords);
    if (isInstanceLevel && isPaused) {
      refreshLogs();
      setPausedLiveRecords(undefined);
    }
  };

  const changeTimeRange = (selectedTimeRange: LogConsoleTimeRange) => {
    restartLogs(new Date().toISOString());
    setSelectedBucket(undefined);
    setLogConsoleTimeRange(selectedTimeRange);
  };

  const changeFilters = (filters: LogConsoleFilter[]) => {
    restartLogs(new Date().toISOString());
    setInstanceLevelContext(undefined);
    setSelectedBucket(undefined);
    setLogConsoleFilters(filters);
  };

  const openLog = (entry: EventLogRecord) => {
    setLogConsoleSelectedLog({ source: displayedSource, entry });
  };

  const isStreaming = isLive && !selectedBucket && !isDefined(error);

  const logsAction = isStreaming
    ? { label: t`Clear`, Icon: IconEraser, onClick: clearLogs }
    : { label: t`Refresh`, Icon: IconRefresh, onClick: refreshLogs };

  const pauseLabel = isPaused ? t`Resume` : t`Pause`;

  const renderLogs = () => {
    if (isDefined(error)) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Something went wrong while loading logs. Please try again.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (!loading && displayedEntryCount === 0) {
      return (
        <SettingsEmptyPlaceholder>{t`No event logs found`}</SettingsEmptyPlaceholder>
      );
    }

    return (
      <LogConsoleTable
        source={displayedSource}
        entries={
          isCleared && !isInstanceLevel
            ? liveEntries
            : [...liveEntries, ...records]
        }
        liveEntryCount={liveEntries.length}
        loading={loading && (!isCleared || isInstanceLevel)}
        hasNextPage={hasNextPage && (!isCleared || isInstanceLevel)}
        selectedEntry={logConsoleSelectedLog?.entry}
        onLoadMore={loadMore}
        onEntryClick={openLog}
      />
    );
  };

  return (
    <StyledResults>
      <LogConsoleToolbar
        filterFields={source.filterFields ?? []}
        filters={logConsoleFilters}
        onFiltersChange={changeFilters}
        logsAction={logsAction}
      >
        {source.id === 'app-logs' &&
          (canQueryInstanceLevel || isInstanceLevel) && (
            <StyledInstanceControl>
              <Checkbox
                checked={isInstanceLevel}
                onCheckedChange={(checked) => {
                  restartLogs(new Date().toISOString());
                  setSelectedBucket(undefined);
                  setInstanceLevelContext(
                    checked === true ? filterContextKey : undefined,
                  );
                }}
              />
              {t`Instance level`}
            </StyledInstanceControl>
          )}
        {isStreaming && (
          <IconButton
            tooltip={pauseLabel}
            aria-label={pauseLabel}
            onClick={togglePause}
          >
            {isPaused ? <IconPlayerPlay /> : <IconPlayerPause />}
          </IconButton>
        )}
        <LogConsoleTimeRangeDropdown
          timeRange={timeRange}
          onTimeRangeChange={changeTimeRange}
        />
      </LogConsoleToolbar>
      {source.id === 'app-logs' && (
        <LogConsoleActivity
          input={{
            table: source.table,
            instanceLevel: isInstanceLevel,
            filters: { dateRange, fieldFilters },
          }}
          isPaused={isPaused}
          isLive={isLive}
          selection={selectedBucket}
          onSelectionChange={(selection) => {
            restartLogs(new Date().toISOString());
            setSelectedBucket(selection);
          }}
        />
      )}
      {renderLogs()}
    </StyledResults>
  );
};
