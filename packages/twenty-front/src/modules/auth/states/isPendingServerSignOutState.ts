import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Set when a signOut may not have reached the server, so the next boot retries the revocation.
export const isPendingServerSignOutState = createAtomState<boolean>({
  key: 'isPendingServerSignOutState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
