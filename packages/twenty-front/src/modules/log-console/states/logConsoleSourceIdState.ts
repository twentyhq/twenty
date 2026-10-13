import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleSourceIdState = createAtomState<LogConsoleSourceId>({
  key: 'logConsoleSourceIdState',
  defaultValue: 'record-changes',
});
