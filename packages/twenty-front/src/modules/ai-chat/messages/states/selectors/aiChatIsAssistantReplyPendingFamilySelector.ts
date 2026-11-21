import { isDefined } from 'twenty-shared/utils';

import { aiChatReplyStatusFamilyState } from '@/ai-chat/states/aiChatReplyStatusFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai-chat/states/aiChatIsSendingMessageFamilyState';
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
          get(aiChatReplyStatusFamilyState, { threadId }) ===
            'awaiting-first-chunk' &&
          !get(aiChatIsSendingMessageFamilyState, { threadId })
        );
      },
  });
