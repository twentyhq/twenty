import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPaint } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';

export const useOpenEmailPageStyleInSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailPageStyleInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.EmailPageStyle,
      pageTitle: t`Email style`,
      pageIcon: IconPaint,
      pageId: v4(),
      resetNavigationStack: true,
    });
  }, [navigateSidePanelMenu, t]);

  return { openEmailPageStyleInSidePanel };
};
