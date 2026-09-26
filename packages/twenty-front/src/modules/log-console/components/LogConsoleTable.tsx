import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useInView } from 'react-intersection-observer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const SKELETON_ROW_COUNT = 8;

const StyledHeaderRow = styled(TableRow)`
  background-color: ${themeCssVariables.background.primary};
  border-radius: 0;
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledLoadMoreTrigger = styled.div`
  height: 1px;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  container-type: size;
`;

const StyledEntriesSinceClear = styled(TableBody)`
  justify-content: flex-end;
  min-height: calc(100cqh - ${themeCssVariables.spacing[8]});
`;

type LogConsoleTableProps = {
  source: LogConsoleSource;
  entries: EventLogRecord[];
  liveEntryCount: number;
  entriesSinceClear?: EventLogRecord[];
  searchQuery?: string;
  loading: boolean;
  hasNextPage: boolean;
  selectedEntry?: EventLogRecord;
  onLoadMore: () => void;
  onEntryClick: (entry: EventLogRecord) => void;
};

const filterBySearchQuery = (
  entriesToFilter: EventLogRecord[],
  query: string,
) => {
  const lowerQuery = query.toLowerCase();

  return entriesToFilter.filter((entry) =>
    entry.event.toLowerCase().includes(lowerQuery),
  );
};

export const LogConsoleTable = ({
  source,
  entries,
  liveEntryCount,
  entriesSinceClear,
  searchQuery,
  loading,
  hasNextPage,
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

  const columns = source.columns;

  const gridTemplateColumns = columns
    .map((column) => column.gridTrack)
    .join(' ');

  const filteredEntries =
    searchQuery ? filterBySearchQuery(entries, searchQuery) : entries;

  const filteredEntriesSinceClear =
    isDefined(entriesSinceClear) && searchQuery
      ? filterBySearchQuery(entriesSinceClear, searchQuery)
      : entriesSinceClear;

  const isInitialLoading = loading && entries.length === 0;

  const isLoadingNextPage = loading && hasNextPage;

  const storedEntryCount = entries.length - liveEntryCount;

  const renderEntryRow = (entry: EventLogRecord, key: number) => (
    <TableRow
      key={key}
      gridTemplateColumns={gridTemplateColumns}
      isExpanded={
        isDefined(selectedEntry) && isDeeplyEqual(entry, selectedEntry)
      }
      onClick={() => onEntryClick(entry)}
    >
      {columns.map((column, columnIndex) => {
        const isFirstColumn = columnIndex === 0;
        const EntryCell = isFirstColumn ? StyledNameTableCell : TableCell;

        return (
          <EntryCell
            key={column.id}
            align={column.align}
            gap={themeCssVariables.spacing[2]}
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {column.renderCell(entry, isFirstColumn ? 'primary' : 'secondary')}
          </EntryCell>
        );
      })}
    </TableRow>
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
        {isDefined(filteredEntriesSinceClear) && (
          <StyledEntriesSinceClear>
            {filteredEntriesSinceClear.map((entry, entryIndex) =>
              renderEntryRow(
                entry,
                filteredEntriesSinceClear.length - entryIndex,
              ),
            )}
          </StyledEntriesSinceClear>
        )}
        {filteredEntries.map((entry, entryIndex) =>
          renderEntryRow(entry, liveEntryCount - entryIndex),
        )}
        {hasNextPage && (
          <StyledLoadMoreTrigger
            key={storedEntryCount}
            ref={loadMoreTriggerRef}
          />
        )}
        {(isInitialLoading || isLoadingNextPage) && (
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
        )}
      </Table>
    </StyledScrollWrapper>
  );
};
