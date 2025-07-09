import { atom } from 'recoil';

export const agentStreamingMessageState = atom<{
  toolCall: string;
  textDelta: string;
}>({
  key: 'agentStreamingMessageState',
  default: {
    toolCall: '',
    textDelta: '',
  },
});
