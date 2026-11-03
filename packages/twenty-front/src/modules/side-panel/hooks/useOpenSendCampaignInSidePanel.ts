import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSend } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';
import { useLingui } from '@lingui/react/macro';

export const useOpenSendCampaignInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSendCampaignInSidePanel = useCallback(
    (campaignId: string) => {
      const pageId = v4();

      store.set(
        sendCampaignCampaignIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        campaignId,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SendCampaign,
        pageTitle: t`Send Campaign`,
        pageIcon: IconSend,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openSendCampaignInSidePanel };
};
