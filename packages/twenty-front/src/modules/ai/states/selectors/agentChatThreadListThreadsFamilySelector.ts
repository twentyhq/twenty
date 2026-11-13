import { isAgentChatThreadInPresetFilter } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { filterAgentChatThreadsWithinLoadedPages } from '@/ai/utils/filterAgentChatThreadsWithinLoadedPages';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { isAgentChatThreadInChannelView } from '@/ai/utils/isAgentChatThreadInChannelView';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadListThreadsFamilySelector =
  createAtomFamilySelector<AgentChatThreadRecord[], AgentChatThreadListSource>({
    key: 'agentChatThreadListThreadsFamilySelector',
    get:
      (source) =>
      ({ get }) => {
        const recentThreads = get(agentChatRecentThreadsSelector);

        if (source.type === 'recent') {
          return recentThreads.filter(
            (thread) =>
              !isDefined(thread.deletedAt) &&
              (!isDefined(thread.channelId) ||
                get(agentChatThreadInboxStatusFamilySelector, thread.id)
                  .scope !== 'NONE'),
          );
        }

        const threadList = get(
          agentChatThreadListFamilyState,
          getAgentChatThreadListSourceKey(source),
        );
        const listedThreads = (threadList?.threadIds ?? [])
          .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
          .filter(isDefined);
        const threadsById = new Map(
          [...recentThreads, ...listedThreads].map((thread) => [
            thread.id,
            thread,
          ]),
        );
        const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;

        const threads = [...threadsById.values()].filter((thread) => {
          const inboxStatus = get(
            agentChatThreadInboxStatusFamilySelector,
            thread.id,
          );

          if (source.type === 'channel') {
            return isAgentChatThreadInChannelView({
              thread,
              channelView: source.channelView,
              currentWorkspaceMemberId,
              isMentioned: inboxStatus.isMentioned,
            });
          }

          return (
            !isDefined(thread.deletedAt) &&
            isAgentChatThreadInPresetFilter({
              thread,
              inboxStatus,
              presetFilter: source.presetFilter,
            })
          );
        });

        return filterAgentChatThreadsWithinLoadedPages({
          threads,
          pagedList: threadList,
        });
      },
  });
