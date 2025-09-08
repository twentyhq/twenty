import { atom } from 'recoil';

export const agentStreamingMessageState = atom<{
  toolCall: string;
  streamingText: string;
  reasoningSummary: string;
}>({
  key: 'agentStreamingMessageState',
  default: {
    toolCall: '',
    streamingText: '',
    reasoningSummary: '',
  },
});
