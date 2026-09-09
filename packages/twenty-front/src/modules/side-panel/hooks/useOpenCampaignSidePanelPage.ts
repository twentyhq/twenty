import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { type PurposeBuiltSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { type sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';

type CampaignIdComponentState = typeof sendCampaignCampaignIdComponentState;

// Both campaign panels seed their campaign id on a page instance that does not
// exist yet, so the id has to be written against the new pageId before the
// navigation that mounts it.
export const useOpenCampaignSidePanelPage = ({
  campaignIdComponentState,
  page,
  pageTitle,
  pageIcon,
}: {
  campaignIdComponentState: CampaignIdComponentState;
  page: PurposeBuiltSidePanelPage;
  pageTitle: string;
  pageIcon: IconComponent;
}) => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  return useCallback(
    (campaignId: string) => {
      const pageId = v4();

      store.set(
        campaignIdComponentState.atomFamily({ instanceId: pageId }),
        campaignId,
      );

      navigateSidePanelMenu({ page, pageTitle, pageIcon, pageId });
    },
    [
      campaignIdComponentState,
      navigateSidePanelMenu,
      page,
      pageIcon,
      pageTitle,
      store,
    ],
  );
};
