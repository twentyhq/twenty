import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconZzz } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';

export const useOpenSnoozeAiChatInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSnoozeAiChatInSidePanel = useCallback(
    (threadIds: string[]) => {
      const pageId = v4();

      store.set(
        snoozeAiChatThreadIdsComponentState.atomFamily({ instanceId: pageId }),
        threadIds,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SnoozeAiChat,
        pageTitle: t`Snooze`,
        pageIcon: IconZzz,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openSnoozeAiChatInSidePanel };
};
