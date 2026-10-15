import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleAppAnalyticsRangeState =
  createAtomState<LogConsoleAppAnalyticsRange>({
    key: 'logConsoleAppAnalyticsRangeState',
    defaultValue: { kind: 'preset', preset: '30d' },
  });
