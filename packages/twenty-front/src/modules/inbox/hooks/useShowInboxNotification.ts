import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatPreviewPlainText } from '@/ai/utils/getAiChatPreviewPlainText';
import { getAiChatThreadDisplayLabel } from '@/ai/utils/getAiChatThreadDisplayLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { INBOX_NOTIFICATION_FALLBACK_ICON_PATH } from '@/inbox/constants/InboxNotificationFallbackIconPath';
import { getInboxNotificationTitle } from '@/inbox/utils/getInboxNotificationTitle';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { createPageNotification } from '~/utils/createPageNotification';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const useShowInboxNotification = () => {
  const { t } = useLingui();
  const store = useStore();
  const { handleThreadClick } = useAiChatThreadClick();

  const showInboxNotification = useCallback(
    (thread: AiChatThreadRecord) => {
      const currentWorkspaceMember = store.get(
        currentWorkspaceMemberState.atom,
      );
      const workspaceMembers = store.get(currentWorkspaceMembersState.atom);
      const { displayName: assistantDisplayName } = store.get(
        aiChatAssistantProfileSelector.atom,
      );
      const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
      const sender = workspaceMembers.find(
        ({ id }) => id === senderWorkspaceMemberId,
      );
      const senderLabel = isDefined(sender)
        ? getWorkspaceMemberNameOrEmail(sender)
        : t`Former member`;
      const previewText =
        (currentWorkspaceMember?.isInboxNotificationPreviewEnabled ?? true)
          ? getAiChatPreviewPlainText({
              markdown: thread.lastMessageText ?? '',
              assistantDisplayName,
            })
          : '';

      const notification = createPageNotification(
        getInboxNotificationTitle({
          isDirectMessage:
            thread.conversationType ===
            AgentChatThreadConversationType.DIRECT_MESSAGE,
          senderName: isDefined(senderWorkspaceMemberId) ? senderLabel : null,
          threadLabel: getAiChatThreadDisplayLabel({
            thread,
            currentWorkspaceMemberId: currentWorkspaceMember?.id,
            workspaceMembers,
            fallbackLabel: t`New chat`,
            formerMemberLabel: t`Former member`,
          }),
        }),
        {
          body: isNonEmptyString(previewText) ? previewText : t`New message`,
          icon:
            getAbsoluteImageUrl(sender?.avatarUrl) ??
            `${window.location.origin}${INBOX_NOTIFICATION_FALLBACK_ICON_PATH}`,
          tag: `inbox-${thread.id}-${thread.lastActivityAt}`,
        },
      );

      if (!isDefined(notification)) {
        return;
      }

      notification.onclick = () => {
        window.focus();
        handleThreadClick({ id: thread.id });
        notification.close();
      };
    },
    [handleThreadClick, store, t],
  );

  return { showInboxNotification };
};
