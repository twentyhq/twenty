import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadIsDirectMessageFamilySelector =
  createAtomFamilySelector<boolean, string | null>({
    key: 'agentChatThreadIsDirectMessageFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        if (!isDefined(threadId)) {
          return false;
        }

        return (
          get(agentChatThreadRecordFamilySelector, threadId)
            ?.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE
        );
      },
  });
