import {
  AgentChatThreadConversationType,
  getAgentChatDirectMessagePeerWorkspaceMemberIds,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { aiChatThreadInboxStatusFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadInboxStatusFamilySelector';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { type InboxDirectMessageSidebarItem } from '@/inbox/types/InboxDirectMessageSidebarItem';
import { sortAiChatThreadsByLastActivityDesc } from '@/ai-chat/threads/utils/sortAiChatThreadsByLastActivityDesc';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const inboxDirectMessageSidebarItemsSelector = createAtomSelector<
  InboxDirectMessageSidebarItem[]
>({
  key: 'inboxDirectMessageSidebarItemsSelector',
  get: ({ get }) => {
    const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
    const workspaceMembers = get(currentWorkspaceMembersState);
    const directMessageThreads = get(inboxRecentThreadsSelector).filter(
      (thread) =>
        !isDefined(thread.deletedAt) &&
        thread.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE,
    );

    return sortAiChatThreadsByLastActivityDesc(directMessageThreads).map(
      (thread) => {
        const [peerWorkspaceMemberId] =
          getAgentChatDirectMessagePeerWorkspaceMemberIds({
            thread,
            currentWorkspaceMemberId,
          });
        const peerWorkspaceMember = workspaceMembers.find(
          ({ id }) => id === peerWorkspaceMemberId,
        );
        const { isUnread } = get(
          aiChatThreadInboxStatusFamilySelector,
          thread.id,
        );

        if (!isDefined(peerWorkspaceMember)) {
          return { threadId: thread.id, peer: null, isUnread };
        }

        return {
          threadId: thread.id,
          peer: {
            workspaceMemberId: peerWorkspaceMember.id,
            name: getWorkspaceMemberNameOrEmail(peerWorkspaceMember),
            avatarUrl: peerWorkspaceMember.avatarUrl,
            email: peerWorkspaceMember.userEmail,
          },
          isUnread,
        };
      },
    );
  },
  areEqual: isDeeplyEqual,
});
