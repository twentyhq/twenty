import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';

export const useOpenEmailBlockStyleInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { goBackFromSidePanel } = useSidePanelHistory();

  const getCurrentSidePanelPage = useCallback(
    () => store.get(sidePanelNavigationStackState.atom).at(-1)?.page,
    [store],
  );

  const openEmailBlockStyleInSidePanel = useCallback(() => {
    if (getCurrentSidePanelPage() === SidePanelPages.EmailBlockStyle) {
      return;
    }

    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockStyle,
      pageTitle: t`Style`,
      pageIcon: IconAdjustments,
      pageId: v4(),
    });
  }, [getCurrentSidePanelPage, navigateSidePanelMenu]);

  const followEmailBlockSelectionInSidePanel = useCallback(
    (editor: Editor) => {
      const hasBlockTarget = isDefined(getBlockSelectionTarget(editor));

      switch (getCurrentSidePanelPage()) {
        case SidePanelPages.EmailBlockSettings:
          if (hasBlockTarget) {
            openEmailBlockStyleInSidePanel();
          }
          return;
        case SidePanelPages.EmailBlockStyle:
          if (!hasBlockTarget) {
            goBackFromSidePanel();
          }
          return;
        default:
          return;
      }
    },
    [
      getCurrentSidePanelPage,
      goBackFromSidePanel,
      openEmailBlockStyleInSidePanel,
    ],
  );

  return {
    openEmailBlockStyleInSidePanel,
    followEmailBlockSelectionInSidePanel,
  };
};
