import { useCallback } from 'react';

import { SidePanelPages } from 'twenty-shared/types';
import { IconSend } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { t } from '@lingui/core/macro';

export const useOpenCampaignComposerInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openCampaignComposerInSidePanel = useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.ComposeCampaign,
      pageTitle: t`New Campaign`,
      pageIcon: IconSend,
      pageId: v4(),
    });
  }, [navigateSidePanelMenu]);

  return { openCampaignComposerInSidePanel };
};
