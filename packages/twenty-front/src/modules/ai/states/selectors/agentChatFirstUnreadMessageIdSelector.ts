import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { isInboxMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { isSilentInboxMessage } from '@/ai/utils/isSilentAgentChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// The member's own messages are never new to them; a message without a sender
// predates multiplayer chats, when every user message was the owner's
export const inboxFirstUnreadMessageIdSelector = createAtomSelector<
  string | null
>({
  key: 'inboxFirstUnreadMessageIdSelector',
  get: ({ get }) => {
    const threadId = get(inboxDisplayedThreadState);
    const visit = get(inboxThreadVisitState);

    if (
      !isDefined(threadId) ||
      visit?.threadId !== threadId ||
      !visit.isUnread
    ) {
      return null;
    }

    const currentWorkspaceMember = get(currentWorkspaceMemberState);
    const threadOwnerWorkspaceMemberId = get(
      inboxThreadRecordFamilySelector,
      threadId,
    )?.workspaceMemberId;
    const isSenderlessMessageOwn =
      !isDefined(threadOwnerWorkspaceMemberId) ||
      threadOwnerWorkspaceMemberId === currentWorkspaceMember?.id;
    const lastReadAtMs = isDefined(visit.lastReadAt)
      ? new Date(visit.lastReadAt).getTime()
      : null;

    const messages = get(inboxDisplayedThreadMessagesSelector).filter(
      (message) => !isSilentInboxMessage(message),
    );

    const firstUnreadMessageIndex = messages.findIndex((message) => {
      const createdAt = message.metadata?.createdAt;

      if (message.role === AGENT_MESSAGE_ROLE.SYSTEM || !isDefined(createdAt)) {
        return false;
      }

      if (message.role === AGENT_MESSAGE_ROLE.USER) {
        const isOwnMessage = isInboxMessageOwn({
          message,
          currentWorkspaceMemberId: currentWorkspaceMember?.id,
          isSenderlessUserMessageOwn: isSenderlessMessageOwn,
        });

        if (isOwnMessage) {
          return false;
        }
      }

      return (
        !isDefined(lastReadAtMs) || new Date(createdAt).getTime() > lastReadAtMs
      );
    });

    return firstUnreadMessageIndex > 0
      ? messages[firstUnreadMessageIndex].id
      : null;
  },
});
