import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconClock } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatIsInChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatIsInChannelComponentState';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';

export const useOpenSnoozeAiChatInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSnoozeAiChatInSidePanel = useCallback(
    (threadIds: string[], { isInChannel = false } = {}) => {
      const pageId = v4();

      store.set(
        snoozeAiChatThreadIdsComponentState.atomFamily({ instanceId: pageId }),
        threadIds,
      );
      store.set(
        snoozeAiChatIsInChannelComponentState.atomFamily({
          instanceId: pageId,
        }),
        isInChannel,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SnoozeAiChat,
        pageTitle: t`Snooze`,
        pageIcon: IconClock,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openSnoozeAiChatInSidePanel };
};
