import { atom } from 'recoil';

export const agentStreamingMessageState = atom<string>({
  key: 'agentStreamingMessageState',
  default: '',
});
