import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastAuthenticatedMethodState =
  createAtomState<AuthenticatedMethod | null>({
    key: 'lastAuthenticatedMethodState',
    defaultValue: null,
    useLocalStorage: true,
  });
