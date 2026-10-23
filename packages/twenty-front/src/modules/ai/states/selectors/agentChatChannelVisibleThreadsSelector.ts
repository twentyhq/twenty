import { isDefined } from 'twenty-shared/utils';

import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { isAgentChatThreadInChannelView } from '@/ai/utils/isAgentChatThreadInChannelView';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Chats past the loaded pages wait for them, so the list has no gaps
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
    const channelThreadList = get(agentChatShownChannelThreadListSelector);

    // Read on their own, as a refresh replaces the main list with its first page
    const channelThreads = isDefined(channelThreadList)
      ? channelThreadList.threadIds
          .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
          .filter(isDefined)
      : [];
    const threadsById = new Map(
      [...get(agentChatThreadsSelector), ...channelThreads].map((thread) => [
        thread.id,
        thread,
      ]),
    );

    const threads = [...threadsById.values()].filter((thread) =>
      isAgentChatThreadInChannelView({
        thread,
        channelView,
        currentWorkspaceMemberId,
      }),
    );

    if (!isDefined(channelThreadList) || !channelThreadList.hasNextPage) {
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
