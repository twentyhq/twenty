import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCookieAuthActiveState = createAtomState<boolean>({
  key: 'isCookieAuthActiveState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
