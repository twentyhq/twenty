import { atom } from 'recoil';

export const currentAIChatThreadState = atom<string | null>({
  key: 'ai/currentAIChatThreadState',
  default: null,
});
