import { atom } from 'recoil';

export const agentChatCurrentContextState = atom<boolean>({
  default: false,
  key: 'agentChatCurrentContextState',
});