import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { EventLogJsonCell } from '@/settings/event-logs/components/EventLogJsonCell';
import { type EventLogRecord } from '~/generated-metadata/graphql';

type LogConsoleChangesCellProps = {
  entry: EventLogRecord;
};

export const LogConsoleChangesCell = ({
  entry,
}: LogConsoleChangesCellProps) => {
  const { t } = useLingui();

  const summary = LOG_CONSOLE_RECORD_ACTIONS[entry.event]?.summary;

  if (isDefined(summary)) {
    return <Text truncate>{t(summary)}</Text>;
  }

  return (
    <EventLogJsonCell
      value={entry.properties as Record<string, unknown>}
    />
  );
};
