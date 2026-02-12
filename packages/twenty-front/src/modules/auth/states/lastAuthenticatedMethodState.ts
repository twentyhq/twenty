import { atom } from 'recoil';

import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

const LAST_AUTHENTICATED_METHOD_STORAGE_KEY = 'lastAuthenticatedMethodState';

export const lastAuthenticatedMethodState = atom<AuthenticatedMethod | null>({
  key: LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
  default: null,
  effects: [localStorageEffect()],
});
