import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isLogConsoleEnabledState = createAtomState<boolean>({
  key: 'isLogConsoleEnabledAtom',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
