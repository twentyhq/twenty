import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconClock } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';

export const useOpenSnoozeAiChatInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSnoozeAiChatInSidePanel = useCallback(
    (threadId: string) => {
      const pageId = v4();

      store.set(
        snoozeAiChatThreadIdComponentState.atomFamily({ instanceId: pageId }),
        threadId,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SnoozeAiChat,
        pageTitle: t`Snooze until`,
        pageIcon: IconClock,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openSnoozeAiChatInSidePanel };
};
