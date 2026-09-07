import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSend } from 'twenty-ui/icon';

import { useOpenCampaignSidePanelPage } from '@/side-panel/hooks/useOpenCampaignSidePanelPage';
import { sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';

export const useOpenSendCampaignInSidePanel = () => {
  const openSendCampaignInSidePanel = useOpenCampaignSidePanelPage({
    campaignIdComponentState: sendCampaignCampaignIdComponentState,
    page: SidePanelPages.SendCampaign,
    pageTitle: t`Send Campaign`,
    pageIcon: IconSend,
  });

  return { openSendCampaignInSidePanel };
};
