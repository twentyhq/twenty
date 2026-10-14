import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleDisplayModeState = createAtomState<'collapsed' | 'open'>(
  {
    key: 'logConsoleDisplayModeState',
    defaultValue: 'collapsed',
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  },
);
