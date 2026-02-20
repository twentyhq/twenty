import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastAuthenticatedMethodState =
  createStateV2<AuthenticatedMethod | null>({
    key: 'lastAuthenticatedMethodState',
    defaultValue: null,
    useLocalStorage: true,
  });
