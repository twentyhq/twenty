import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, LightButton } from 'twenty-ui/components';
import {
  IconEraser,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { DATE_FORMAT_WITHOUT_YEAR } from '@/localization/constants/DateFormatWithoutYear';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { LogConsoleFilterBar } from '@/log-console/components/LogConsoleFilterBar';
import { LogConsoleTable } from '@/log-console/components/LogConsoleTable';
import { LogConsoleTimeRangeDropdown } from '@/log-console/components/LogConsoleTimeRangeDropdown';
import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { isLogConsoleSelectedLogOpenedSelector } from '@/log-console/states/isLogConsoleSelectedLogOpenedSelector';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
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
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const RECORDS_PER_PAGE = 100;

const getLaterDate = (date: string, otherDate: string) =>
  new Date(otherDate).getTime() > new Date(date).getTime() ? otherDate : date;

const StyledResults = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[8]};
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: grid;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: max-content minmax(0, auto) max-content;
  justify-content: end;
`;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { navigateSidePanel } = useNavigateSidePanel();
  const timeZone = useLogConsoleTimeZone();
  const { dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { retentionInDays } = useLogConsoleRetention(source);

  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const isLogConsoleSelectedLogOpened = useAtomStateValue(
    isLogConsoleSelectedLogOpenedSelector,
  );
  const [logConsoleTimeRange, setLogConsoleTimeRange] = useAtomState(
    logConsoleTimeRangeState,
  );
  const [logConsoleFilters, setLogConsoleFilters] = useAtomState(
    logConsoleFiltersState,
  );
  const [refreshedAt, setRefreshedAt] = useState(() =>
    new Date().toISOString(),
  );
  const [clearedAt, setClearedAt] = useState<string>();
  const [pausedLiveRecords, setPausedLiveRecords] =
    useState<EventLogRecord[]>();

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

  const getDateRange = (now: string) => {
    const rangeBounds = getLogConsoleTimeRangeBounds({
      timeRange,
      now,
      timeZone,
    });

    return isDefined(clearedAt)
      ? { ...rangeBounds, start: getLaterDate(rangeBounds.start, clearedAt) }
      : rangeBounds;
  };

  const getEventLogsInput = (now: string) => ({
    table: source.table,
    first: RECORDS_PER_PAGE,
    filters: { dateRange: getDateRange(now), fieldFilters },
  });

  const dateRange = getDateRange(refreshedAt);

  const isLive = !isDefined(dateRange.end);
  const isPaused = isDefined(pausedLiveRecords);

  const { records, totalCount, loading, error, loadMore, refetch } =
    useEventLogs(getEventLogsInput(refreshedAt));

  const { liveRecords, clearLiveRecords } = useEventLogsLiveStream({
    table: source.table,
    fieldFilters,
    enabled: isLive,
  });

  const displayedLiveRecords = pausedLiveRecords ?? liveRecords;

  const displayedRecords = [...displayedLiveRecords, ...records];

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
  };

  const refreshLogs = () => {
    const now = new Date().toISOString();

    restartLogs(now);
    void refetch({ input: getEventLogsInput(now) });
  };

  const clearLogs = () => {
    const now = new Date().toISOString();

    restartLogs(now);
    setPausedLiveRecords(undefined);
    setClearedAt(now);
  };

  const reloadHistory = () => {
    restartLogs(new Date().toISOString());
    setClearedAt(undefined);
  };

  const togglePause = () => {
    setPausedLiveRecords(isPaused ? undefined : liveRecords);
  };

  const changeTimeRange = (selectedTimeRange: LogConsoleTimeRange) => {
    restartLogs(new Date().toISOString());
    setClearedAt(undefined);
    setLogConsoleTimeRange(selectedTimeRange);
  };

  const changeFilters = (filters: LogConsoleFilter[]) => {
    restartLogs(new Date().toISOString());
    setLogConsoleFilters(filters);
  };

  const openLog = (entry: EventLogRecord) => {
    setLogConsoleSelectedLog({ source, entry });
    navigateSidePanel({
      page: SidePanelPages.LogDetail,
      pageTitle: t(source.entryLabel),
      pageIcon: source.Icon,
      resetNavigationStack: true,
    });
  };

  const formatRangeDate = (date: string, format: string) =>
    formatInTimeZone(date, timeZone, format, { locale: localeCatalog });

  const formatRangeBound = (date: string) => {
    const boundDateFormat =
      formatRangeDate(date, 'yyyy') === formatRangeDate(refreshedAt, 'yyyy')
        ? DATE_FORMAT_WITHOUT_YEAR[
            getWorkspaceDateFormatFromDateFormat(dateFormat)
          ]
        : dateFormat;

    return formatRangeDate(date, `${boundDateFormat}, ${timeFormat}`);
  };

  const rangeEnd =
    dateRange.end ??
    [
      refreshedAt,
      ...displayedLiveRecords.map(({ timestamp }) => timestamp),
    ].reduce(getLaterDate);

  const displayedCount = totalCount + displayedLiveRecords.length;

  const countLabel = source.getCountLabel({
    count: displayedCount,
    formattedCount: formatNumber(displayedCount),
  });

  const summaryRange = `· ${formatRangeBound(dateRange.start)} – ${formatRangeBound(rangeEnd)}`;

  const summaryTimeZone = formatRangeDate(rangeEnd, 'zzz');

  const isInitialLoading = loading && displayedRecords.length === 0;

  const pauseLabel = isPaused ? t`Resume` : t`Pause`;

  const renderLogs = () => {
    if (isDefined(error)) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Something went wrong while loading logs. Please try again.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (!loading && displayedRecords.length === 0) {
      return (
        <SettingsEmptyPlaceholder>{t`No event logs found`}</SettingsEmptyPlaceholder>
      );
    }

    return (
      <LogConsoleTable
        source={source}
        entries={displayedRecords}
        liveEntryCount={displayedLiveRecords.length}
        loading={loading}
        selectedEntry={
          isLogConsoleSelectedLogOpened
            ? logConsoleSelectedLog?.entry
            : undefined
        }
        onLoadMore={loadMore}
        onEntryClick={openLog}
      />
    );
  };

  return (
    <StyledResults>
      <StyledToolbar>
        <LogConsoleTimeRangeDropdown
          source={source}
          timeRange={timeRange}
          onTimeRangeChange={changeTimeRange}
        />
        {isDefined(source.filterFields) && (
          <LogConsoleFilterBar
            filterFields={source.filterFields}
            filters={logConsoleFilters}
            onFiltersChange={changeFilters}
          />
        )}
        <StyledSummary>
          {!isInitialLoading && !isDefined(error) && (
            <>
              <span>{countLabel}</span>
              <OverflowingTextWithTooltip
                text={summaryRange}
                tooltipContent={`${countLabel} ${summaryRange} ${summaryTimeZone}`}
              />
              <span>{summaryTimeZone}</span>
            </>
          )}
        </StyledSummary>
        {isDefined(clearedAt) && (
          <LightButton emphasis="subtle" onClick={reloadHistory}>
            {t`Reload history`}
          </LightButton>
        )}
        {isLive && (
          <>
            <IconButton
              size="sm"
              variant="ghost"
              tooltip={pauseLabel}
              aria-label={pauseLabel}
              onClick={togglePause}
            >
              {isPaused ? <IconPlayerPlay /> : <IconPlayerPause />}
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              tooltip={t`Clear`}
              aria-label={t`Clear`}
              onClick={clearLogs}
            >
              <IconEraser />
            </IconButton>
          </>
        )}
        <IconButton
          size="sm"
          variant="ghost"
          tooltip={t`Refresh`}
          aria-label={t`Refresh`}
          loading={loading}
          onClick={refreshLogs}
        >
          <IconRefresh />
        </IconButton>
      </StyledToolbar>
      {renderLogs()}
    </StyledResults>
  );
};
