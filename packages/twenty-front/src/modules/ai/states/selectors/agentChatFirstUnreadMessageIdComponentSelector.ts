import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
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

        const currentUserWorkspaceId = get(
          currentWorkspaceMemberState,
        )?.userWorkspaceId;
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

            if (
              !isDefined(senderUserWorkspaceId) ||
              senderUserWorkspaceId === currentUserWorkspaceId
            ) {
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
