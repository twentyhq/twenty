import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const logConsoleColumnWidthsFamilyState = createAtomFamilyState<
  Record<string, number>,
  LogConsoleSourceId
>({
  key: 'logConsoleColumnWidthsFamilyState',
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
