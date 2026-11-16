import { isDefined } from 'twenty-shared/utils';

import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsAssistantReplyPendingFamilySelector =
  createAtomFamilySelector<boolean, string | null>({
    key: 'aiChatIsAssistantReplyPendingFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        if (!isDefined(threadId)) {
          return false;
        }

        return (
          get(aiChatIsAwaitingFirstChunkFamilyState, { threadId }) &&
          !get(aiChatIsSendingMessageFamilyState, { threadId })
        );
      },
  });
