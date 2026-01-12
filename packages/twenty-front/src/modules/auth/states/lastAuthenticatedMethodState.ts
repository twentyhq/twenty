import { atom } from 'recoil';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export type LastAuthenticatedMethod = 'google' | 'microsoft' | 'sso' | null;

export const lastAuthenticatedMethodState = atom<LastAuthenticatedMethod>({
  key: 'lastAuthenticatedMethodState',
  default: null,
  effects: [localStorageEffect()],
});
