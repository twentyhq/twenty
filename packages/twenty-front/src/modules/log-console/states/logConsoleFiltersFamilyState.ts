import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const logConsoleFiltersFamilyState = createAtomFamilyState<
  LogConsoleFilter[],
  LogConsoleSourceId
>({
  key: 'logConsoleFiltersFamilyState',
  defaultValue: [],
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
