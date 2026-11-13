import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconZzz } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSnoozeInboxForChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/isSnoozeAiChatForChannelComponentState';
import { snoozeInboxThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';

export const useOpenSnoozeInboxInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSnoozeInboxInSidePanel = useCallback(
    ({
      threadIds,
      isInChannel,
    }: {
      threadIds: string[];
      isInChannel: boolean;
    }) => {
      const pageId = v4();

      store.set(
        snoozeInboxThreadIdsComponentState.atomFamily({ instanceId: pageId }),
        threadIds,
      );
      store.set(
        isSnoozeInboxForChannelComponentState.atomFamily({
          instanceId: pageId,
        }),
        isInChannel,
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

  return { openSnoozeInboxInSidePanel };
};
