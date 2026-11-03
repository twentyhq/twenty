import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';

export const useOpenEmailBlockStyleInSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailBlockStyleInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockStyle,
      pageTitle: t`Block style`,
      pageIcon: IconAdjustments,
      pageId: v4(),
      resetNavigationStack: true,
    });
  }, [navigateSidePanelMenu, t]);

  return { openEmailBlockStyleInSidePanel };
};
