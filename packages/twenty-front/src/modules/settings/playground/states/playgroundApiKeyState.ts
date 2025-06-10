import { atom } from 'recoil';
import { localStorageEffect } from '~/utils/recoil-effects';

export const playgroundApiKeyState = atom<string | null>({
  key: 'playgroundApiKeyState',
  default: null,
  effects: [localStorageEffect()],
});
