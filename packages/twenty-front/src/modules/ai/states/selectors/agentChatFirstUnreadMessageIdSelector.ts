import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { isAiChatMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { isSilentAiChatMessage } from '@/ai/utils/isSilentAgentChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// The member's own messages are never new to them; a message without a sender
// predates multiplayer chats, when every user message was the owner's
export const aiChatFirstUnreadMessageIdSelector = createAtomSelector<
  string | null
>({
  key: 'aiChatFirstUnreadMessageIdSelector',
  get: ({ get }) => {
    const threadId = get(aiChatDisplayedThreadState);
    const visit = get(aiChatThreadVisitState);

    if (
      !isDefined(threadId) ||
      visit?.threadId !== threadId ||
      !visit.isUnread
    ) {
      return null;
    }

    const currentWorkspaceMember = get(currentWorkspaceMemberState);
    const threadOwnerWorkspaceMemberId = get(
      aiChatThreadRecordFamilySelector,
      threadId,
    )?.workspaceMemberId;
    const isSenderlessMessageOwn =
      !isDefined(threadOwnerWorkspaceMemberId) ||
      threadOwnerWorkspaceMemberId === currentWorkspaceMember?.id;
    const lastReadAtMs = isDefined(visit.lastReadAt)
      ? new Date(visit.lastReadAt).getTime()
      : null;

    const messages = get(aiChatDisplayedThreadMessagesSelector).filter(
      (message) => !isSilentAiChatMessage(message),
    );

    const firstUnreadMessageIndex = messages.findIndex((message) => {
      const createdAt = message.metadata?.createdAt;

      if (message.role === AGENT_MESSAGE_ROLE.SYSTEM || !isDefined(createdAt)) {
        return false;
      }

      if (message.role === AGENT_MESSAGE_ROLE.USER) {
        const isOwnMessage = isAiChatMessageOwn({
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
