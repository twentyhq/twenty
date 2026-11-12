import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getAgentChatDirectMessagePeerWorkspaceMemberIds } from '@/ai/utils/getAgentChatDirectMessagePeerWorkspaceMemberIds';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const agentChatDirectMessageSidebarItemsSelector = createAtomSelector<
  DirectMessageSidebarItem[]
>({
  key: 'agentChatDirectMessageSidebarItemsSelector',
  get: ({ get }) => {
    const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
    const workspaceMembers = get(currentWorkspaceMembersState);
    const directMessageThreads = get(agentChatRecentThreadsSelector).filter(
      (thread) =>
        !isDefined(thread.deletedAt) &&
        thread.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE,
    );

    return sortChatThreadsByLastActivityDesc(directMessageThreads).map(
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
          agentChatThreadInboxStatusFamilySelector,
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
