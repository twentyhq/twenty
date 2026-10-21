import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Every chat the member can still open, whatever its place in their inbox
export const agentChatRecentThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatRecentThreadsSelector',
  get: ({ get }) =>
    get(agentChatThreadsSelector).filter(
      (thread) => !isDefined(thread.deletedAt),
    ),
});
