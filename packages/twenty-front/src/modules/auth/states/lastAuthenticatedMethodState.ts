import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const lastAuthenticatedMethodState =
  createState<AuthenticatedMethod | null>({
    key: 'lastAuthenticatedMethodState',
    defaultValue: null,
    useLocalStorage: true,
  });
