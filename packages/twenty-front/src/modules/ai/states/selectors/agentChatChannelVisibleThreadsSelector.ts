import { isDefined } from 'twenty-shared/utils';

import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
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

    const { lastLoadedActivityAt } = channelThreadList;

    if (!isDefined(lastLoadedActivityAt)) {
      return threads;
    }

    const lastLoadedActivityTime = new Date(lastLoadedActivityAt).getTime();

    return threads.filter(
      (thread) =>
        new Date(getAgentChatThreadLastActivityAt(thread)).getTime() >=
        lastLoadedActivityTime,
    );
  },
});
