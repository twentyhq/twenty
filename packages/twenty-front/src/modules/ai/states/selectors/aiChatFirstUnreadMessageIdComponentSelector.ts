import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { aiChatThreadVisitFamilyState } from '@/ai/states/aiChatThreadVisitFamilyState';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatMessageOwn } from '@/ai/utils/isAiChatMessageOwn';
import { isSilentAiChatMessage } from '@/ai/utils/isSilentAiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

// A senderless user message predates multiplayer chats, when every user message was the owner's
export const aiChatFirstUnreadMessageIdComponentSelector =
  createAtomComponentSelector<string | null>({
    key: 'aiChatFirstUnreadMessageIdComponentSelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const threadId = get(aiChatDisplayedThreadComponentState, {
          instanceId,
        });
        if (!isDefined(threadId)) {
          return null;
        }

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

        const messages = get(aiChatDisplayedThreadMessagesComponentSelector, {
          instanceId,
        }).filter((message) => !isSilentAiChatMessage(message));

        const firstUnreadMessageIndex = messages.findIndex((message) => {
          const createdAt = message.metadata?.createdAt;

          if (
            message.role === AGENT_MESSAGE_ROLE.SYSTEM ||
            !isDefined(createdAt)
          ) {
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
            !isDefined(lastReadAtMs) ||
            new Date(createdAt).getTime() > lastReadAtMs
          );
        });

        return firstUnreadMessageIndex > 0
          ? messages[firstUnreadMessageIndex].id
          : null;
      },
  });
