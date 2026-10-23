import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Every chat the member can open, except channel chats they never followed
export const agentChatRecentThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatRecentThreadsSelector',
  get: ({ get }) =>
    get(agentChatThreadsSelector).filter(
      (thread) =>
        !isDefined(thread.deletedAt) &&
        (!isDefined(thread.channelId) ||
          get(agentChatThreadInboxStatusFamilySelector, thread.id).scope !==
            'NONE'),
    ),
});
