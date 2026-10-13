import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleDisplayModeState = createAtomState<
  'collapsed' | 'open' | 'closed'
>({
  key: 'logConsoleDisplayModeState',
  defaultValue: 'closed',
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
