import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// True once the app has confirmed the httpOnly session cookie authenticates
// requests, at which point the localStorage token pair is dropped and the
// cookie is the only credential. Persisted so later boots skip the probe.
export const isCookieAuthActiveState = createAtomState<boolean>({
  key: 'isCookieAuthActiveState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
