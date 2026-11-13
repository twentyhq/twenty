import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { inboxThreadMemberStateFamilySelector } from '@/inbox/states/selectors/inboxThreadMemberStateFamilySelector';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getInboxDirectMessagePeerWorkspaceMemberIds } from '@/inbox/utils/getInboxDirectMessagePeerWorkspaceMemberIds';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const inboxDirectMessageSidebarItemsSelector = createAtomSelector<
  DirectMessageSidebarItem[]
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

    return sortChatThreadsByLastActivityDesc(directMessageThreads).map(
      (thread) => {
        const [peerWorkspaceMemberId] =
          getInboxDirectMessagePeerWorkspaceMemberIds({
            thread,
            currentWorkspaceMemberId,
          });
        const peerWorkspaceMember = workspaceMembers.find(
          ({ id }) => id === peerWorkspaceMemberId,
        );
        const { isUnread } = get(
          inboxThreadMemberStateFamilySelector,
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
