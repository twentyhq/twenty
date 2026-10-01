import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { useOpenEmailBlockSettingsInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockSettingsInSidePanel';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';

export const useOpenEmailBlockStyleInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { openEmailBlockSettingsInSidePanel } =
    useOpenEmailBlockSettingsInSidePanel();

  const openEmailBlockStyleInSidePanel = useCallback(() => {
    openEmailBlockSettingsInSidePanel();
    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockStyle,
      pageTitle: t`Style`,
      pageIcon: IconAdjustments,
      pageId: v4(),
    });
  }, [navigateSidePanelMenu, openEmailBlockSettingsInSidePanel]);

  const followEmailBlockSelectionInSidePanel = useCallback(
    (editor: Editor) => {
      const hasBlockTarget = isDefined(getBlockSelectionTarget(editor));

      switch (store.get(sidePanelNavigationStackState.atom).at(-1)?.page) {
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
    [goBackFromSidePanel, openEmailBlockStyleInSidePanel, store],
  );

  return {
    openEmailBlockStyleInSidePanel,
    followEmailBlockSelectionInSidePanel,
  };
};
