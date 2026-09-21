import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/icon';

import { useOpenCampaignSidePanelPage } from '@/side-panel/hooks/useOpenCampaignSidePanelPage';
import { sendCampaignTestCampaignIdComponentState } from '@/side-panel/pages/send-campaign-test/states/sendCampaignTestCampaignIdComponentState';

export const useOpenSendCampaignTestInSidePanel = () => {
  const openSendCampaignTestInSidePanel = useOpenCampaignSidePanelPage({
    campaignIdComponentState: sendCampaignTestCampaignIdComponentState,
    page: SidePanelPages.SendCampaignTest,
    pageTitle: t`Send Test Email`,
    pageIcon: IconMail,
  });

  return { openSendCampaignTestInSidePanel };
};
