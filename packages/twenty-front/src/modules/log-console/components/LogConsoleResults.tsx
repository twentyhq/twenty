import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { IconRefresh } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { DATE_FORMAT_WITHOUT_YEAR } from '@/localization/constants/DateFormatWithoutYear';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { LogConsoleTable } from '@/log-console/components/LogConsoleTable';
import { LogConsoleTimeRangeDropdown } from '@/log-console/components/LogConsoleTimeRangeDropdown';
import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { isLogConsoleSelectedLogOpenedSelector } from '@/log-console/states/isLogConsoleSelectedLogOpenedSelector';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { getLogConsoleTimeRangeBounds } from '@/log-console/utils/getLogConsoleTimeRangeBounds';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const RECORDS_PER_PAGE = 100;

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
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  min-width: 0;
`;

const StyledTimeZone = styled.span`
  flex-shrink: 0;
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
  const [refreshedAt, setRefreshedAt] = useState(() =>
    new Date().toISOString(),
  );

  const timeRange = isLogConsoleTimeRangeWithinRetention({
    timeRange: logConsoleTimeRange,
    retentionInDays,
  })
    ? logConsoleTimeRange
    : '24h';

  const getDateRange = (now: string) =>
    getLogConsoleTimeRangeBounds({ timeRange, now, timeZone });

  const getEventLogsInput = (now: string) => ({
    table: source.table,
    first: RECORDS_PER_PAGE,
    filters: {
      dateRange: getDateRange(now),
      fieldFilters: source.fieldFilters,
    },
  });

  const dateRange = getDateRange(refreshedAt);

  const { records, totalCount, loading, error, loadMore, refetch } =
    useEventLogs(getEventLogsInput(refreshedAt));

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID,
  );

  const scrollToTop = () => {
    getScrollWrapperElement().scrollWrapperElement?.scrollTo({ top: 0 });
  };

  const refreshLogs = () => {
    const now = new Date().toISOString();

    scrollToTop();
    setRefreshedAt(now);
    void refetch({ input: getEventLogsInput(now) });
  };

  const changeTimeRange = (selectedTimeRange: LogConsoleTimeRange) => {
    scrollToTop();
    setRefreshedAt(new Date().toISOString());
    setLogConsoleTimeRange(selectedTimeRange);
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

  const rangeEnd = dateRange.end ?? refreshedAt;

  const countLabel = source.getCountLabel({
    count: totalCount,
    formattedCount: formatNumber(totalCount),
  });

  const summary = `${countLabel} · ${formatRangeBound(dateRange.start)} – ${formatRangeBound(rangeEnd)}`;

  const summaryTimeZone = formatRangeDate(rangeEnd, 'zzz');

  const isInitialLoading = loading && records.length === 0;

  const renderLogs = () => {
    if (isDefined(error)) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Something went wrong while loading logs. Please try again.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (!loading && records.length === 0) {
      return (
        <SettingsEmptyPlaceholder>{t`No event logs found`}</SettingsEmptyPlaceholder>
      );
    }

    return (
      <LogConsoleTable
        source={source}
        entries={records}
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
        <StyledSummary>
          {!isInitialLoading && !isDefined(error) && (
            <>
              <OverflowingTextWithTooltip
                text={summary}
                tooltipContent={`${summary} ${summaryTimeZone}`}
              />
              <StyledTimeZone>{summaryTimeZone}</StyledTimeZone>
            </>
          )}
        </StyledSummary>
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
