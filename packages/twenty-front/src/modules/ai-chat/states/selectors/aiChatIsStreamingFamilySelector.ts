import { aiChatReplyStatusFamilyState } from '@/ai-chat/states/aiChatReplyStatusFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsStreamingFamilySelector = createAtomFamilySelector<
  boolean,
  string | null
>({
  key: 'aiChatIsStreamingFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatReplyStatusFamilyState, { threadId }) === 'streaming',
});
