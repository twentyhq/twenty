import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleTimeRangeState = createAtomState<LogConsoleTimeRange>({
  key: 'logConsoleTimeRangeState',
  defaultValue: '24h',
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (timeRange) =>
    [
      'today',
      'yesterday',
      ...Object.keys(LOG_CONSOLE_TIME_RANGE_PRESETS),
    ].includes(timeRange),
});
