import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxThreadIsDirectMessageFamilySelector =
  createAtomFamilySelector<boolean, string | null>({
    key: 'inboxThreadIsDirectMessageFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        if (!isDefined(threadId)) {
          return false;
        }

        return (
          get(aiChatThreadRecordFamilySelector, threadId)?.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE
        );
      },
  });
