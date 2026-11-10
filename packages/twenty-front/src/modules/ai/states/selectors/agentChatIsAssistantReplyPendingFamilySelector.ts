import { isDefined } from 'twenty-shared/utils';

import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// The send mutation returns once the server has decided whether the assistant replies
export const agentChatIsAssistantReplyPendingFamilySelector =
  createAtomFamilySelector<boolean, string | null>({
    key: 'agentChatIsAssistantReplyPendingFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        if (!isDefined(threadId)) {
          return false;
        }

        return (
          get(agentChatIsAwaitingFirstChunkFamilyState, { threadId }) &&
          !get(agentChatIsSendingMessageFamilyState, { threadId })
        );
      },
  });
