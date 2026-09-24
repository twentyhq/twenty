import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { EventLogResultsTable } from '@/settings/event-logs/components/EventLogResultsTable';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import { SettingsLogsLockedPlaceholder } from '@/settings/log-explorer/components/SettingsLogsLockedPlaceholder';
import { type SettingsLogsSource } from '@/settings/log-explorer/types/SettingsLogsSource';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const RECORDS_PER_PAGE = 100;

type SettingsLogsResultsProps = {
  source: SettingsLogsSource;
};

export const SettingsLogsResults = ({ source }: SettingsLogsResultsProps) => {
  const { t } = useLingui();

  const { records, hasNextPage, loading, error, loadMore } = useEventLogs({
    table: source.table,
    first: RECORDS_PER_PAGE,
  });

  if (isGraphqlErrorOfType(error, 'NO_ENTITLEMENT')) {
    return <SettingsLogsLockedPlaceholder />;
  }

  if (isDefined(error)) {
    return (
      <SettingsEmptyPlaceholder>
        {t`Something went wrong while loading logs. Please try again.`}
      </SettingsEmptyPlaceholder>
    );
  }

  return (
    <EventLogResultsTable
      records={records}
      loading={loading}
      hasNextPage={hasNextPage}
      onLoadMore={loadMore}
      selectedTable={source.table}
    />
  );
};
