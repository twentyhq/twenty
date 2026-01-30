import { atom } from 'recoil';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const playgroundApiKeyState = atom<string | null>({
  key: 'playgroundApiKeyState',
  default: null,
  effects: [localStorageEffect()],
});
