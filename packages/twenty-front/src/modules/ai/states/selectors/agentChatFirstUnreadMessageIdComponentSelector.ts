import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

// The member's own messages are never new to them; a message without a sender
// predates multiplayer chats, when every user message was the owner's
export const agentChatFirstUnreadMessageIdComponentSelector =
  createAtomComponentSelector<string | null>({
    key: 'agentChatFirstUnreadMessageIdComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const threadId = get(agentChatDisplayedThreadState);
        const unreadSince = get(agentChatThreadUnreadSinceState);

        if (
          !isDefined(threadId) ||
          unreadSince?.threadId !== threadId ||
          !unreadSince.isUnread
        ) {
          return null;
        }

        const currentWorkspaceMember = get(currentWorkspaceMemberState);
        const threadOwnerWorkspaceMemberId = (
          get(recordStoreFamilyState, threadId) as
            | AgentChatThreadRecord
            | null
            | undefined
        )?.workspaceMemberId;
        const isSenderlessMessageOwn =
          !isDefined(threadOwnerWorkspaceMemberId) ||
          threadOwnerWorkspaceMemberId === currentWorkspaceMember?.id;
        const lastReadAtMs = isDefined(unreadSince.lastReadAt)
          ? new Date(unreadSince.lastReadAt).getTime()
          : null;

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId },
        });

        const firstUnreadMessage = messages.find((message) => {
          const createdAt = message.metadata?.createdAt;

          if (
            message.role === AgentMessageRole.SYSTEM ||
            !isDefined(createdAt)
          ) {
            return false;
          }

          if (message.role === AgentMessageRole.USER) {
            const senderUserWorkspaceId =
              message.metadata?.senderUserWorkspaceId;

            const isOwnMessage = isDefined(senderUserWorkspaceId)
              ? senderUserWorkspaceId ===
                currentWorkspaceMember?.userWorkspaceId
              : isSenderlessMessageOwn;

            if (isOwnMessage) {
              return false;
            }
          }

          return (
            lastReadAtMs === null ||
            new Date(createdAt).getTime() > lastReadAtMs
          );
        });

        return firstUnreadMessage?.id ?? null;
      },
  });
