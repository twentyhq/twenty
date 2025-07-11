import { atom } from 'recoil';

export const agentChatSelectedFilesState = atom<File[]>({
  key: 'agentChatSelectedFilesState',
  default: [],
});
