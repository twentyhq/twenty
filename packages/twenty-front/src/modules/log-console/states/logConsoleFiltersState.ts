import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleFiltersState = createAtomState<LogConsoleFilter[]>({
  key: 'logConsoleFiltersState',
  defaultValue: [],
});
