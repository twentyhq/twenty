import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sendCampaignTestCampaignIdComponentState } from '@/side-panel/pages/send-campaign-test/states/sendCampaignTestCampaignIdComponentState';
import { t } from '@lingui/core/macro';

export const useOpenSendCampaignTestInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSendCampaignTestInSidePanel = useCallback(
    (campaignId: string) => {
      const pageId = v4();

      store.set(
        sendCampaignTestCampaignIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        campaignId,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SendCampaignTest,
        pageTitle: t`Send Test Email`,
        pageIcon: IconMail,
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openSendCampaignTestInSidePanel };
};
