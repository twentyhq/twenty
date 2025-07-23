import { atom } from 'recoil';

export const agentChatInputState = atom<string>({
  default: '',
  key: 'agentChatInputState',
});
