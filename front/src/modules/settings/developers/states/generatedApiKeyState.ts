import { atom } from 'recoil';

export const generatedApiKeyState = atom<string | null | undefined>({
  key: 'generatedApiKeyState',
  default: null,
});
