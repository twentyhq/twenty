import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';

export const useOpenEmailBlockSettingsInSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailBlockSettingsInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockSettings,
      pageTitle: t`Add block`,
      pageIcon: IconPlus,
      pageId: v4(),
      resetNavigationStack: true,
    });
  }, [navigateSidePanelMenu, t]);

  return { openEmailBlockSettingsInSidePanel };
};
