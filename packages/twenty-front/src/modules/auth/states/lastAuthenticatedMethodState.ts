import { atom } from 'recoil';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export type LastAuthenticatedMethod = 'google' | 'microsoft' | 'sso' | null;

export const LAST_AUTHENTICATED_METHOD_STORAGE_KEY =
  'lastAuthenticatedMethodState';

export const lastAuthenticatedMethodState = atom<LastAuthenticatedMethod>({
  key: LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
  default: null,
  effects: [localStorageEffect()],
});
