import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsLogsEmptyState } from '@/log-console/components/SettingsLogsEmptyState';
import { SettingsLogsErrorState } from '@/log-console/components/SettingsLogsErrorState';
import { SettingsLogsTable } from '@/log-console/components/SettingsLogsTable';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';

const RECORDS_PER_PAGE = 100;

const StyledResults = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledCount = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  height: ${themeCssVariables.spacing[4]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledTableContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { formatNumber } = useNumberFormat();

  const { records, totalCount, loading, error, loadMore, refetch } =
    useEventLogs({
      table: source.table,
      first: RECORDS_PER_PAGE,
    });

  if (isDefined(error)) {
    return <SettingsLogsErrorState onRetry={() => void refetch()} />;
  }

  if (!loading && records.length === 0) {
    return <SettingsLogsEmptyState />;
  }

  return (
    <StyledResults>
      <StyledCount>
        {records.length > 0 &&
          source.getCountLabel({
            count: totalCount,
            formattedCount: formatNumber(totalCount),
          })}
      </StyledCount>
      <StyledTableContainer>
        <SettingsLogsTable
          source={source}
          entries={records}
          loading={loading}
          onLoadMore={loadMore}
        />
      </StyledTableContainer>
    </StyledResults>
  );
};
