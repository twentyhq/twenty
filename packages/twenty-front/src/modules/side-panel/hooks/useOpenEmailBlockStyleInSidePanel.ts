import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';

export const useOpenEmailBlockStyleInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailBlockStyleInSidePanel = useCallback(() => {
    const currentPage = store
      .get(sidePanelNavigationStackState.atom)
      .at(-1)?.page;

    if (currentPage === SidePanelPages.EmailBlockStyle) {
      return;
    }

    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockStyle,
      pageTitle: t`Style`,
      pageIcon: IconAdjustments,
      pageId: v4(),
    });
  }, [navigateSidePanelMenu, store]);

  return { openEmailBlockStyleInSidePanel };
};
