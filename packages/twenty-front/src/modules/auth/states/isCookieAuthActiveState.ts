import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Set once the cookie is confirmed to authenticate, at which point the token
// pair is dropped. Persisted so later boots skip the probe.
export const isCookieAuthActiveState = createAtomState<boolean>({
  key: 'isCookieAuthActiveState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
