import { useCallback } from 'react';

import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSend } from 'twenty-ui/display';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { composeCampaignDefaultSubjectComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignDefaultSubjectComponentState';
import { composeCampaignRecipientPersonIdsComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignRecipientPersonIdsComponentState';

type OpenComposeCampaignParams = {
  recipientPersonIds: string[];
  defaultSubject?: string;
};

export const useOpenComposeCampaignInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openComposeCampaignInSidePanel = useCallback(
    (params: OpenComposeCampaignParams) => {
      const pageId = v4();

      store.set(
        composeCampaignRecipientPersonIdsComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.recipientPersonIds,
      );

      store.set(
        composeCampaignDefaultSubjectComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.defaultSubject ?? '',
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ComposeCampaign,
        pageTitle: t`New Campaign`,
        pageIcon: IconSend,
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openComposeCampaignInSidePanel };
};
