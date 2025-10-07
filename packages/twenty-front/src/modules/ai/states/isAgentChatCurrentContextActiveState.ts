import { atom } from 'recoil';

export const isAgentChatCurrentContextActiveState = atom<boolean>({
  key: 'ai/isAgentChatCurrentContextActiveState',
  default: true,
});
