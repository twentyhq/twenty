import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSentMessageHandOffState = createAtomState<{
  composerTextRect: DOMRect;
  messageId: string | null;
} | null>({
  key: 'ai/agentChatSentMessageHandOffState',
  defaultValue: null,
});
