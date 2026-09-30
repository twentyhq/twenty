import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSentMessageHandOffState = createAtomState<{
  composerTextRect: Pick<DOMRect, 'left' | 'top'>;
  messageId: string | null;
} | null>({
  key: 'ai/agentChatSentMessageHandOffState',
  defaultValue: null,
});
