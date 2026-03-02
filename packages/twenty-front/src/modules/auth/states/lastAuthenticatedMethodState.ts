import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastAuthenticatedMethodState =
  createAtomState<AuthenticatedMethod | null>({
    key: 'lastAuthenticatedMethodState',
    defaultValue: null,
    useLocalStorage: true,
  });
