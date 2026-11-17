import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatThreadVisitFamilyState } from '@/ai/states/aiChatThreadVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatMessageOwn } from '@/ai/utils/isAiChatMessageOwn';
import { isSilentAiChatMessage } from '@/ai/utils/isSilentAiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// A senderless user message predates multiplayer chats, when every user message was the owner's
export const aiChatFirstUnreadMessageIdFamilySelector =
  createAtomFamilySelector<string | null, string>({
    key: 'aiChatFirstUnreadMessageIdFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const visit = get(aiChatThreadVisitFamilyState, { threadId });

        if (!visit?.isUnread) {
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

        const messages = get(aiChatMessagesFamilyState, { threadId }).filter(
          (message) => !isSilentAiChatMessage(message),
        );

        const firstUnreadMessageIndex = messages.findIndex((message) => {
          const createdAt = message.metadata?.createdAt;

          if (
            message.role === AGENT_MESSAGE_ROLE.SYSTEM ||
            !isDefined(createdAt)
          ) {
            return false;
          }

          const isOwnUserMessage =
            message.role === AGENT_MESSAGE_ROLE.USER &&
            isAiChatMessageOwn({
              message,
              currentWorkspaceMemberId: currentWorkspaceMember?.id,
              isSenderlessUserMessageOwn: isSenderlessMessageOwn,
            });

          if (isOwnUserMessage) {
            return false;
          }

          return (
            !isDefined(lastReadAtMs) ||
            new Date(createdAt).getTime() > lastReadAtMs
          );
        });

        return firstUnreadMessageIndex > 0
          ? messages[firstUnreadMessageIndex].id
          : null;
      },
  });
