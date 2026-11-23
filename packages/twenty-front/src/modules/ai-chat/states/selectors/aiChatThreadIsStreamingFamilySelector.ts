import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadIsStreamingFamilySelector = createAtomFamilySelector<
  boolean,
  { threadId: string | null }
>({
  key: 'aiChatThreadIsStreamingFamilySelector',
  get:
    ({ threadId }) =>
    ({ get }) =>
      get(aiChatThreadReplyStatusFamilyState, { threadId }) === 'streaming',
});
