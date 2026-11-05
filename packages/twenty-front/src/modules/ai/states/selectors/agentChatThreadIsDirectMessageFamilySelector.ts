import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadIsDirectMessageFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'agentChatThreadIsDirectMessageFamilySelector',
    get:
      (threadId) =>
      ({ get }) =>
        get(agentChatThreadRecordFamilySelector, threadId)?.conversationType ===
        AgentChatThreadConversationType.DIRECT_MESSAGE,
  });
