import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
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
        const visit = get(agentChatThreadVisitState);

        if (
          !isDefined(threadId) ||
          visit?.threadId !== threadId ||
          !visit.isUnread
        ) {
          return null;
        }

        const currentWorkspaceMember = get(currentWorkspaceMemberState);
        const threadOwnerWorkspaceMemberId = get(
          agentChatThreadRecordFamilySelector,
          threadId,
        )?.workspaceMemberId;
        const isSenderlessMessageOwn =
          !isDefined(threadOwnerWorkspaceMemberId) ||
          threadOwnerWorkspaceMemberId === currentWorkspaceMember?.id;
        const lastReadAtMs = isDefined(visit.lastReadAt)
          ? new Date(visit.lastReadAt).getTime()
          : null;

        const messages = get(
          agentChatDisplayedThreadMessagesComponentSelector,
          {
            instanceId,
          },
        );

        const firstUnreadMessage = messages.find((message) => {
          const createdAt = message.metadata?.createdAt;

          if (
            message.role === AGENT_MESSAGE_ROLE.SYSTEM ||
            !isDefined(createdAt)
          ) {
            return false;
          }

          if (message.role === AGENT_MESSAGE_ROLE.USER) {
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
            !isDefined(lastReadAtMs) ||
            new Date(createdAt).getTime() > lastReadAtMs
          );
        });

        return firstUnreadMessage?.id ?? null;
      },
  });
