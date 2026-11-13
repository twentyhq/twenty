import { isAgentChatThreadInPresetFilter } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/inboxThreadMemberStateFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { inboxRecentThreadsSelector } from '@/ai/states/selectors/inboxRecentThreadsSelector';
import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { filterAiChatThreadsWithinLoadedPages } from '@/ai/utils/filterAiChatThreadsWithinLoadedPages';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { isInboxThreadInChannelView } from '@/ai/utils/isInboxThreadInChannelView';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxThreadListThreadsFamilySelector = createAtomFamilySelector<
  AiChatThreadRecord[],
  InboxThreadListSource
>({
  key: 'inboxThreadListThreadsFamilySelector',
  get:
    (source) =>
    ({ get }) => {
      const recentThreads = get(inboxRecentThreadsSelector);

      if (source.type === 'recent') {
        return recentThreads.filter(
          (thread) =>
            !isDefined(thread.deletedAt) &&
            (!isDefined(thread.channelId) ||
              get(inboxThreadMemberStateFamilySelector, thread.id).scope !==
                'NONE'),
        );
      }

      const threadList = get(
        inboxThreadListFamilyState,
        getInboxThreadListSourceKey(source),
      );
      const listedThreads = (threadList?.threadIds ?? [])
        .map((threadId) => get(aiChatThreadRecordFamilySelector, threadId))
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
          inboxThreadMemberStateFamilySelector,
          thread.id,
        );

        if (source.type === 'channel') {
          return isInboxThreadInChannelView({
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

      return filterAiChatThreadsWithinLoadedPages({
        threads,
        pagedList: threadList,
      });
    },
});
