import { isDefined } from 'twenty-shared/utils';

import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { inboxIsSendingMessageFamilyState } from '@/ai/states/inboxIsSendingMessageFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxIsAssistantReplyPendingFamilySelector =
  createAtomFamilySelector<boolean, string | null>({
    key: 'inboxIsAssistantReplyPendingFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        if (!isDefined(threadId)) {
          return false;
        }

        return (
          get(agentChatIsAwaitingFirstChunkFamilyState, { threadId }) &&
          !get(inboxIsSendingMessageFamilyState, { threadId })
        );
      },
  });
