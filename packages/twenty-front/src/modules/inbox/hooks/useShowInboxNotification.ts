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
import { getAiChatSenderLabel } from '@/ai/utils/getAiChatSenderLabel';
import { getAiChatThreadDisplayLabel } from '@/ai/utils/getAiChatThreadDisplayLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isInboxNotificationPreviewEnabledState } from '@/inbox/states/isInboxNotificationPreviewEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { createBrowserNotification } from '~/utils/createBrowserNotification';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const useShowInboxNotification = () => {
  const { t } = useLingui();
  const store = useStore();
  const { handleThreadClick } = useAiChatThreadClick();
  const isInboxNotificationPreviewEnabled = useAtomStateValue(
    isInboxNotificationPreviewEnabledState,
  );

  const showInboxNotification = useCallback(
    (thread: AiChatThreadRecord) => {
      const workspaceMembers = store.get(currentWorkspaceMembersState.atom);
      const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
      const sender = workspaceMembers.find(
        ({ id }) => id === senderWorkspaceMemberId,
      );
      const senderName = getAiChatSenderLabel({
        sender,
        isCurrentWorkspaceMember: false,
      });
      const threadLabel = getAiChatThreadDisplayLabel({
        thread,
        currentWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
          ?.id,
        workspaceMembers,
        fallbackLabel: t`New chat`,
        formerMemberLabel: t`Former member`,
      });
      const previewText = isInboxNotificationPreviewEnabled
        ? getAiChatPreviewPlainText({
            markdown: thread.lastMessageText ?? '',
            assistantDisplayName: store.get(aiChatAssistantProfileSelector.atom)
              .displayName,
          })
        : '';

      const notification = createBrowserNotification(
        isDefined(senderWorkspaceMemberId) &&
          thread.conversationType !==
            AgentChatThreadConversationType.DIRECT_MESSAGE
          ? t`${senderName} in ${threadLabel}`
          : threadLabel,
        {
          body: isNonEmptyString(previewText) ? previewText : t`New message`,
          icon:
            getAbsoluteImageUrl(sender?.avatarUrl) ??
            `${window.location.origin}/images/icons/android/android-launchericon-192-192.png`,
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
    [handleThreadClick, isInboxNotificationPreviewEnabled, store, t],
  );

  return { showInboxNotification };
};
