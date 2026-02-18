import { atom } from 'recoil';

export const currentAIChatThreadTitleState = atom<string | null>({
  key: 'ai/currentAIChatThreadTitleState',
  default: null,
});
