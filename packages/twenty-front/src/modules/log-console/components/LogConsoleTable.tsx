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

const SKELETON_ROW_COUNT = 8;

const SEVERITY_STRIPE_COLORS: Record<LogConsoleSeverity, string> = {
  error: themeCssVariables.color.red,
  warning: themeCssVariables.color.orange,
};

const StyledHeaderRow = styled(TableRow)`
  background-color: ${themeCssVariables.background.primary};
  border-radius: 0;
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

type LogConsoleTableProps = {
  source: LogConsoleSource;
  entries: EventLogRecord[];
  loading: boolean;
  onLoadMore: () => void;
};

export const LogConsoleTable = ({
  source,
  entries,
  loading,
  onLoadMore,
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

  const gridTemplateColumns = source.columns
    .map((column) => column.gridTrack)
    .join(' ');

  const isInitialLoading = loading && entries.length === 0;

  return (
    <ScrollWrapper componentInstanceId={LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID}>
      <Table>
        <StyledHeaderRow
          gridTemplateColumns={gridTemplateColumns}
          hoverBackgroundColor={themeCssVariables.background.primary}
        >
          {source.columns.map((column) => (
            <TableHeader key={column.id}>{t(column.label)}</TableHeader>
          ))}
        </StyledHeaderRow>
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
                {source.columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton width={80} height={16} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </SkeletonTheme>
        ) : (
          entries.map((entry, entryIndex) => (
            <StyledEntryRow
              key={entryIndex}
              gridTemplateColumns={gridTemplateColumns}
              hoverBackgroundColor={
                themeCssVariables.background.transparent.light
              }
              severity={source.getSeverity?.(entry)}
            >
              {source.columns.map((column) => (
                <TableCell
                  key={column.id}
                  gap={themeCssVariables.spacing[2]}
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {column.renderCell(entry)}
                </TableCell>
              ))}
            </StyledEntryRow>
          ))
        )}
      </Table>
      <StyledLoadMoreTrigger ref={loadMoreTriggerRef} />
    </ScrollWrapper>
  );
};
