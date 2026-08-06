import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const IS_COOKIE_AUTH_ACTIVE_LOCAL_STORAGE_KEY =
  'isCookieAuthActiveState';

export const isCookieAuthActiveState = createAtomState<boolean>({
  key: IS_COOKIE_AUTH_ACTIVE_LOCAL_STORAGE_KEY,
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
