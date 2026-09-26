import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, SearchInput } from 'twenty-ui/components';
import {
  IconEraser,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from 'twenty-ui/icon';
import { useDebouncedCallback } from 'use-debounce';

import { LogConsoleTable } from '@/log-console/components/LogConsoleTable';
import { LogConsoleTimeRangeDropdown } from '@/log-console/components/LogConsoleTimeRangeDropdown';
import { LogConsoleToolbar } from '@/log-console/components/LogConsoleToolbar';
import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleSearchState } from '@/log-console/states/logConsoleSearchState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { getLogConsoleFieldFilters } from '@/log-console/utils/getLogConsoleFieldFilters';
import { getLogConsoleTimeRangeBounds } from '@/log-console/utils/getLogConsoleTimeRangeBounds';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useEventLogsLiveStream } from '@/settings/event-logs/hooks/useEventLogsLiveStream';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { sortByProperty } from '~/utils/array/sortByProperty';

const RECORDS_PER_PAGE = 100;

const SEARCH_DEBOUNCE_IN_MILLISECONDS = 300;

const sortNewestFirst = (eventLogRecords: EventLogRecord[]) =>
  eventLogRecords.toSorted(sortByProperty('timestamp')).toReversed();

const StyledResults = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { t } = useLingui();
  const timeZone = useLogConsoleTimeZone();
  const { retentionInDays } = useLogConsoleRetention(source);

  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const [logConsoleTimeRange, setLogConsoleTimeRange] = useAtomState(
    logConsoleTimeRangeState,
  );
  const [logConsoleFilters, setLogConsoleFilters] = useAtomState(
    logConsoleFiltersState,
  );
  const [logConsoleSearch, setLogConsoleSearch] = useAtomState(
    logConsoleSearchState,
  );
  const [searchInput, setSearchInput] = useState(logConsoleSearch);
  const [refreshedAt, setRefreshedAt] = useState(() =>
    new Date().toISOString(),
  );
  const [pausedLiveRecords, setPausedLiveRecords] =
    useState<EventLogRecord[]>();
  const [clearedLiveRecordCount, setClearedLiveRecordCount] =
    useState<number>();

  const timeRange = isLogConsoleTimeRangeWithinRetention({
    timeRange: logConsoleTimeRange,
    retentionInDays,
  })
    ? logConsoleTimeRange
    : '24h';

  const fieldFilters = getLogConsoleFieldFilters({
    source,
    filters: logConsoleFilters,
  });

  const search = isDefined(source.searchPlaceholder)
    ? logConsoleSearch
    : undefined;

  const getDateRange = (now: string) =>
    getLogConsoleTimeRangeBounds({ timeRange, now, timeZone });

  const getEventLogsInput = (now: string) => ({
    table: source.table,
    first: RECORDS_PER_PAGE,
    filters: { dateRange: getDateRange(now), fieldFilters, search },
  });

  const dateRange = getDateRange(refreshedAt);

  const isLive = !isDefined(dateRange.end);
  const isPaused = isDefined(pausedLiveRecords);

  const { records, hasNextPage, loading, error, loadMore, refetch } =
    useEventLogs(getEventLogsInput(refreshedAt));

  const { liveRecords, clearLiveRecords } = useEventLogsLiveStream({
    table: source.table,
    fieldFilters,
    search,
    enabled: isLive,
  });

  const displayedLiveRecords = pausedLiveRecords ?? liveRecords;

  const liveRecordCountSinceClear = isDefined(clearedLiveRecordCount)
    ? displayedLiveRecords.length - clearedLiveRecordCount
    : 0;

  const liveEntries = sortNewestFirst(
    displayedLiveRecords.slice(liveRecordCountSinceClear),
  );

  const entriesSinceClear = isDefined(clearedLiveRecordCount)
    ? sortNewestFirst(displayedLiveRecords.slice(0, liveRecordCountSinceClear))
    : undefined;

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
  };

  const togglePause = () => {
    setPausedLiveRecords(isPaused ? undefined : liveRecords);
  };

  const changeTimeRange = (selectedTimeRange: LogConsoleTimeRange) => {
    restartLogs(new Date().toISOString());
    setLogConsoleTimeRange(selectedTimeRange);
  };

  const changeFilters = (filters: LogConsoleFilter[]) => {
    restartLogs(new Date().toISOString());
    setLogConsoleFilters(filters);
  };

  const applySearch = useDebouncedCallback((trimmedSearch: string) => {
    if (trimmedSearch !== logConsoleSearch) {
      restartLogs(new Date().toISOString());
      setLogConsoleSearch(trimmedSearch);
    }
  }, SEARCH_DEBOUNCE_IN_MILLISECONDS);

  const changeSearchInput = (value: string) => {
    setSearchInput(value);
    applySearch(value.trim());
  };

  const openLog = (entry: EventLogRecord) => {
    setLogConsoleSelectedLog({ source, entry });
  };

  const isStreaming = isLive && !isDefined(error);

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
        source={source}
        entries={[...liveEntries, ...records]}
        liveEntryCount={liveEntries.length}
        entriesSinceClear={entriesSinceClear}
        searchQuery={logConsoleSearch}
        loading={loading}
        hasNextPage={hasNextPage}
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
        search={
          isDefined(source.searchPlaceholder) ? (
            <SearchInput
              placeholder={t(source.searchPlaceholder)}
              value={searchInput}
              onChange={changeSearchInput}
            />
          ) : undefined
        }
        logsAction={logsAction}
      >
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
          source={source}
          timeRange={timeRange}
          onTimeRangeChange={changeTimeRange}
        />
      </LogConsoleToolbar>
      {renderLogs()}
    </StyledResults>
  );
};
