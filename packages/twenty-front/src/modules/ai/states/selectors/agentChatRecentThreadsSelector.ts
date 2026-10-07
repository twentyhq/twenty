import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Every chat that is the member's, whatever its place in their inbox. Chats
// of a channel they read but never followed stay in the channel's view
export const agentChatRecentThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatRecentThreadsSelector',
  get: ({ get }) =>
    get(agentChatThreadsSelector).filter(
      (thread) =>
        !isDefined(thread.deletedAt) &&
        get(agentChatThreadInboxStatusFamilySelector, thread.id).scope !==
          'NONE',
    ),
});
