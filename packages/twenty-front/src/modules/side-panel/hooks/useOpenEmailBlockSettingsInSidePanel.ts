import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const useOpenEmailBlockSettingsInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEmailBlockSettingsInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.EmailBlockSettings,
      pageTitle: t`Block Settings`,
      pageIcon: IconAdjustments,
      pageId: v4(),
    });
  }, [navigateSidePanelMenu]);

  return { openEmailBlockSettingsInSidePanel };
};
