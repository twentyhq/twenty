import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { startAppConversationTargetComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTargetComponentState';
import { type StartAppConversationTarget } from '@/side-panel/pages/start-app-conversation/types/StartAppConversationTarget';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMessage } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenStartAppConversationInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openStartAppConversationInSidePanel = useCallback(
    (target: StartAppConversationTarget) => {
      const pageId = v4();

      store.set(
        startAppConversationTargetComponentState.atomFamily({
          instanceId: pageId,
        }),
        target,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.StartAppConversation,
        pageTitle: t`New conversation`,
        pageIcon: IconMessage,
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openStartAppConversationInSidePanel };
};
