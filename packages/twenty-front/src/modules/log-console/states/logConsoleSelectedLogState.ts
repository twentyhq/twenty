import { type LogConsoleEventLogSource } from '@/log-console/types/LogConsoleSource';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export const logConsoleSelectedLogState = createAtomState<{
  source: LogConsoleEventLogSource;
  entry: EventLogRecord;
} | null>({
  key: 'logConsoleSelectedLogState',
  defaultValue: null,
});
