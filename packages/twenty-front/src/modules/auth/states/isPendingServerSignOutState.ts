import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Only the server can end an httpOnly session, so a signOut that never
// reached it leaves the cookie alive and the next boot must retry the
// revocation instead of probing back into the session.
export const isPendingServerSignOutState = createAtomState<boolean>({
  key: 'isPendingServerSignOutState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
