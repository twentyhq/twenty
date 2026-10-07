import { isDefined } from 'twenty-shared/utils';

import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { isAgentChatThreadInChannelView } from '@/ai/utils/isAgentChatThreadInChannelView';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Chats loaded for other lists can sort past the channel's loaded pages, and
// wait there until the pages reach them so the list has no gaps
export const agentChatChannelVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatChannelVisibleThreadsSelector',
  get: ({ get }) => {
    const channelView = get(agentChatShownChannelViewSelector);

    if (!isDefined(channelView)) {
      return [];
    }

    const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
    const threads = sortChatThreadsByLastActivityDesc(
      get(agentChatThreadsSelector).filter((thread) =>
        isAgentChatThreadInChannelView({
          thread,
          channelView,
          currentWorkspaceMemberId,
        }),
      ),
    );

    const channelThreadList = get(agentChatChannelThreadListState);

    if (
      channelThreadList?.viewKey !== getAgentChatChannelViewKey(channelView) ||
      !channelThreadList.hasNextPage
    ) {
      return threads;
    }

    const lastLoadedThreadId = channelThreadList.threadIds.at(-1);
    const lastLoadedThreadIndex = threads.findIndex(
      ({ id }) => id === lastLoadedThreadId,
    );

    return lastLoadedThreadIndex === -1
      ? threads
      : threads.slice(0, lastLoadedThreadIndex + 1);
  },
});
