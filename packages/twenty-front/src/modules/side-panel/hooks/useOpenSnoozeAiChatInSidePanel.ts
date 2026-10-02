import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconCalendar, IconClock, type IconComponent } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';

export const useOpenSnoozeAiChatInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSnoozePage = useCallback(
    ({
      threadId,
      page,
      pageTitle,
      pageIcon,
    }: {
      threadId: string;
      page: SidePanelPages.SnoozeAiChat | SidePanelPages.SnoozeAiChatUntilDate;
      pageTitle: string;
      pageIcon: IconComponent;
    }) => {
      const pageId = v4();

      store.set(
        snoozeAiChatThreadIdComponentState.atomFamily({ instanceId: pageId }),
        threadId,
      );

      navigateSidePanelMenu({ page, pageTitle, pageIcon, pageId });
    },
    [navigateSidePanelMenu, store],
  );

  const openSnoozeAiChatInSidePanel = useCallback(
    (threadId: string) =>
      openSnoozePage({
        threadId,
        page: SidePanelPages.SnoozeAiChat,
        pageTitle: t`Snooze`,
        pageIcon: IconClock,
      }),
    [openSnoozePage, t],
  );

  const openSnoozeAiChatUntilDateInSidePanel = useCallback(
    (threadId: string) =>
      openSnoozePage({
        threadId,
        page: SidePanelPages.SnoozeAiChatUntilDate,
        pageTitle: t`Day & Time`,
        pageIcon: IconCalendar,
      }),
    [openSnoozePage, t],
  );

  return { openSnoozeAiChatInSidePanel, openSnoozeAiChatUntilDateInSidePanel };
};
