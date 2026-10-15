import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPaint } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const useOpenEmailPageStyleInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailPageStyleInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.EmailPageStyle,
      pageTitle: t`Email style`,
      pageIcon: IconPaint,
      pageId: v4(),
      resetNavigationStack: true,
    });
  }, [navigateSidePanelMenu]);

  return { openEmailPageStyleInSidePanel };
};
