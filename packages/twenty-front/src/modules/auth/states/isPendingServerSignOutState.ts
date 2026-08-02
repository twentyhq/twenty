import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Set before the signOut mutation and cleared once the server confirmed the
// revocation. If the mutation fails, the httpOnly session cookie is still
// alive in the browser and only the server can end it, so the next boot
// retries the revocation instead of probing back into the session.
export const isPendingServerSignOutState = createAtomState<boolean>({
  key: 'isPendingServerSignOutState',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
