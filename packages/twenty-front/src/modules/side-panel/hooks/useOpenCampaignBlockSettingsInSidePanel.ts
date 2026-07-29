import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconAdjustments } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { t } from '@lingui/core/macro';

export const useOpenCampaignBlockSettingsInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openCampaignBlockSettingsInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.CampaignBlockSettings,
      pageTitle: t`Block Settings`,
      pageIcon: IconAdjustments,
      pageId: v4(),
    });
  }, [navigateSidePanelMenu]);

  return { openCampaignBlockSettingsInSidePanel };
};
