import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconFolderSymlink, IconLink } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatThreadIdComponentState } from '@/side-panel/states/aiChatThreadIdComponentState';

export const useOpenAiChatThreadPageInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAiChatThreadPageInSidePanel = useCallback(
    ({
      threadId,
      page,
    }: {
      threadId: string;
      page:
        | SidePanelPages.MoveAiChatToChannel
        | SidePanelPages.LinkAiChatToRecords;
    }) => {
      const pageId = v4();
      const isMovePage = page === SidePanelPages.MoveAiChatToChannel;

      store.set(
        aiChatThreadIdComponentState.atomFamily({ instanceId: pageId }),
        threadId,
      );

      navigateSidePanelMenu({
        page,
        pageTitle: isMovePage ? t`Move to channel` : t`Link to record`,
        pageIcon: isMovePage ? IconFolderSymlink : IconLink,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openAiChatThreadPageInSidePanel };
};
