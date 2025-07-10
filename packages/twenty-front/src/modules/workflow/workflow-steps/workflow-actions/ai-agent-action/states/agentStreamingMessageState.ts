import { atom } from 'recoil';

export const agentStreamingMessageState = atom<{
  toolCall: string;
  streamingText: string;
}>({
  key: 'agentStreamingMessageState',
  default: {
    toolCall: '',
    streamingText: '',
  },
});
