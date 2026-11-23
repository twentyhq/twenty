import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadViewVisitFamilyState } from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatMessageOwn } from '@/ai-chat/messages/utils/isAiChatMessageOwn';
import { isSilentAiChatMessage } from '@/ai-chat/messages/utils/isSilentAiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatFirstUnreadMessageIdFamilySelector =
  createAtomFamilySelector<string | null, string>({
    key: 'aiChatFirstUnreadMessageIdFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const visit = get(aiChatThreadViewVisitFamilyState, { threadId });

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

        const messages = get(aiChatThreadDisplayedMessagesFamilyState, {
          threadId,
        }).filter((message) => !isSilentAiChatMessage(message));

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
