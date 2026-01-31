import { atom } from 'recoil';

export const isCreatingChatThreadState = atom<boolean>({
  key: 'ai/isCreatingChatThreadState',
  default: false,
});
