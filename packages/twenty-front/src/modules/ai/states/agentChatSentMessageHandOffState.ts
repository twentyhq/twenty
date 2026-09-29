import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSentMessageHandOffState = createAtomState<{
  threadId: string;
  composerTextElement: HTMLElement;
} | null>({
  key: 'ai/agentChatSentMessageHandOffState',
  defaultValue: null,
});
