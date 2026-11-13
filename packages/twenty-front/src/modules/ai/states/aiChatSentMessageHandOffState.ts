import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatSentMessageHandOffState = createAtomState<{
  composerTextRect: Pick<DOMRect, 'left' | 'top'>;
  messageId: string | null;
} | null>({
  key: 'ai/aiChatSentMessageHandOffState',
  defaultValue: null,
});
