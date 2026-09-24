import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { EventLogResultsTable } from '@/settings/event-logs/components/EventLogResultsTable';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';

const RECORDS_PER_PAGE = 100;

type LogConsoleResultsProps = {
  source: LogConsoleSource;
};

export const LogConsoleResults = ({ source }: LogConsoleResultsProps) => {
  const { t } = useLingui();

  const { records, hasNextPage, loading, error, loadMore } = useEventLogs({
    table: source.table,
    first: RECORDS_PER_PAGE,
  });

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
