import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleTimeRangeState = createAtomState<LogConsoleTimeRange>({
  key: 'logConsoleTimeRangeState',
  defaultValue: '24h',
});
