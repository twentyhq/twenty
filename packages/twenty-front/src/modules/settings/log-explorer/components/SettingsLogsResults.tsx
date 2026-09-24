import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { SettingsLogsEmptyState } from '@/settings/log-explorer/components/SettingsLogsEmptyState';
import { SettingsLogsErrorState } from '@/settings/log-explorer/components/SettingsLogsErrorState';
import { SettingsLogsLockedPlaceholder } from '@/settings/log-explorer/components/SettingsLogsLockedPlaceholder';
import { SettingsLogsTable } from '@/settings/log-explorer/components/SettingsLogsTable';
import { type SettingsLogsSource } from '@/settings/log-explorer/types/SettingsLogsSource';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

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

type SettingsLogsResultsProps = {
  source: SettingsLogsSource;
};

export const SettingsLogsResults = ({ source }: SettingsLogsResultsProps) => {
  const { formatNumber } = useNumberFormat();

  const { records, totalCount, loading, error, loadMore, refetch } =
    useEventLogs({
      table: source.table,
      first: RECORDS_PER_PAGE,
    });

  if (isGraphqlErrorOfType(error, 'NO_ENTITLEMENT')) {
    return <SettingsLogsLockedPlaceholder />;
  }

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
