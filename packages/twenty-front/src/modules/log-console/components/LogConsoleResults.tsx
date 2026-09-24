import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleTable } from '@/log-console/components/LogConsoleTable';
import { LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID } from '@/log-console/constants/LogConsoleTableScrollWrapperId';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';

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
  justify-content: flex-end;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const { records, totalCount, loading, error, loadMore, refetch } =
    useEventLogs({
      table: source.table,
      first: RECORDS_PER_PAGE,
    });

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    LOG_CONSOLE_TABLE_SCROLL_WRAPPER_ID,
  );

  const refreshLogs = () => {
    getScrollWrapperElement().scrollWrapperElement?.scrollTo({ top: 0 });
    void refetch();
  };

  const renderLogs = () => {
    if (isDefined(error)) {
      return (
        <ErrorState.Root>
          <ErrorState.Content>
            <ErrorState.Title>{t`Couldn't load logs`}</ErrorState.Title>
          </ErrorState.Content>
          <Button
            variant="outline"
            startIcon={<IconRefresh />}
            onClick={refreshLogs}
          >
            {t`Try again`}
          </Button>
        </ErrorState.Root>
      );
    }

    if (!loading && records.length === 0) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Title>{t`No logs yet`}</EmptyState.Title>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    return (
      <LogConsoleTable
        source={source}
        entries={records}
        loading={loading}
        onLoadMore={loadMore}
      />
    );
  };

  return (
    <StyledResults>
      <StyledToolbar>
        {records.length > 0 && (
          <StyledCount>
            {source.getCountLabel({
              count: totalCount,
              formattedCount: formatNumber(totalCount),
            })}
          </StyledCount>
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
