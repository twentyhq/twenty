import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useInView } from 'react-intersection-observer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const SKELETON_ROW_COUNT = 8;

const SEVERITY_STRIPE_COLORS: Record<LogConsoleSeverity, string> = {
  error: themeCssVariables.color.red,
  warning: themeCssVariables.color.orange,
};

const StyledHeaderRow = styled(TableRow)`
  background-color: ${themeCssVariables.background.primary};
  border-radius: 0;
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledEntryRow = styled(TableRow)<{ severity?: LogConsoleSeverity }>`
  & > :first-child {
    box-shadow: ${({ severity }) =>
      isDefined(severity)
        ? `inset 2px 0 0 ${SEVERITY_STRIPE_COLORS[severity]}`
        : 'none'};
  }
`;

const StyledLoadMoreTrigger = styled.div`
  height: 1px;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  container-type: size;
`;

const StyledEntriesSinceClear = styled.div`
  min-height: calc(100cqh - ${themeCssVariables.spacing[8]});
  padding-top: ${themeCssVariables.spacing[2]};
`;

type LogConsoleTableProps = {
  source: LogConsoleSource;
  entries: EventLogRecord[];
  liveEntryCount: number;
  entriesSinceClear?: EventLogRecord[];
  loading: boolean;
  selectedEntry?: EventLogRecord;
  onLoadMore: () => void;
  onEntryClick: (entry: EventLogRecord) => void;
};

export const LogConsoleTable = ({
  source,
  entries,
  liveEntryCount,
  entriesSinceClear,
  loading,
  selectedEntry,
  onLoadMore,
  onEntryClick,
}: LogConsoleTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement(
    LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID,
  );

  const { ref: loadMoreTriggerRef } = useInView({
    root: scrollWrapperHTMLElement,
    rootMargin: '400px',
    onChange: (inView) => {
      if (inView) {
        onLoadMore();
      }
    },
  });

  const columns = isDefined(selectedEntry)
    ? source.columns.filter((column) => !column.hiddenWhenPanelOpen)
    : source.columns;

  const gridTemplateColumns = columns
    .map((column) => column.gridTrack)
    .join(' ');

  const isInitialLoading = loading && entries.length === 0;

  const renderEntryRow = (entry: EventLogRecord, key: number) => (
    <StyledEntryRow
      key={key}
      gridTemplateColumns={gridTemplateColumns}
      severity={source.getSeverity?.(entry)}
      isSelected={
        isDefined(selectedEntry) && isDeeplyEqual(entry, selectedEntry)
      }
      onClick={() => onEntryClick(entry)}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          align={column.align}
          gap={themeCssVariables.spacing[2]}
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {column.renderCell(entry)}
        </TableCell>
      ))}
    </StyledEntryRow>
  );

  return (
    <StyledScrollWrapper
      componentInstanceId={LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID}
    >
      <Table>
        <StyledHeaderRow
          gridTemplateColumns={gridTemplateColumns}
          hoverBackgroundColor={themeCssVariables.background.primary}
        >
          {columns.map((column) => (
            <TableHeader key={column.id} align={column.align}>
              {t(column.label)}
            </TableHeader>
          ))}
        </StyledHeaderRow>
        {isDefined(entriesSinceClear) && (
          <StyledEntriesSinceClear>
            {entriesSinceClear.map((entry, entryIndex) =>
              renderEntryRow(entry, entriesSinceClear.length - entryIndex),
            )}
          </StyledEntriesSinceClear>
        )}
        {isInitialLoading ? (
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
              <TableRow
                key={rowIndex}
                gridTemplateColumns={gridTemplateColumns}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton width={80} height={16} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </SkeletonTheme>
        ) : (
          entries.map((entry, entryIndex) =>
            renderEntryRow(entry, liveEntryCount - entryIndex),
          )
        )}
      </Table>
      <StyledLoadMoreTrigger ref={loadMoreTriggerRef} />
    </StyledScrollWrapper>
  );
};
