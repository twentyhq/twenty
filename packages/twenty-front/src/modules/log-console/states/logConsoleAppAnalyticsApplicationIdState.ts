import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleAppAnalyticsApplicationIdState = createAtomState<
  string | null
>({
  key: 'logConsoleAppAnalyticsApplicationIdState',
  defaultValue: null,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
