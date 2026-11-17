import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isInboxNotificationPreviewEnabledState } from '@/inbox/states/isInboxNotificationPreviewEnabledState';
import { getInboxNotificationContent } from '@/inbox/utils/getInboxNotificationContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { createBrowserNotification } from '~/utils/createBrowserNotification';

export const useShowInboxNotification = () => {
  const store = useStore();
  const { handleThreadClick } = useAiChatThreadClick();
  const isInboxNotificationPreviewEnabled = useAtomStateValue(
    isInboxNotificationPreviewEnabledState,
  );

  const showInboxNotification = useCallback(
    (thread: AiChatThreadRecord) => {
      const notification = createBrowserNotification(
        getInboxNotificationContent({
          thread,
          workspaceMembers: store.get(currentWorkspaceMembersState.atom),
          currentWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
            ?.id,
          assistantDisplayName: store.get(aiChatAssistantProfileSelector.atom)
            .displayName,
          isPreviewEnabled: isInboxNotificationPreviewEnabled,
        }),
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
    [handleThreadClick, isInboxNotificationPreviewEnabled, store],
  );

  return { showInboxNotification };
};
