import { useCallback } from 'react';

import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import {
  type RecordGqlOperationFilter,
  SidePanelPages,
} from 'twenty-shared/types';
import { IconSend } from 'twenty-ui/display';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { composeCampaignDefaultSubjectComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignDefaultSubjectComponentState';
import { composeCampaignRecipientFilterComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignRecipientFilterComponentState';

type OpenComposeCampaignParams = {
  recipientFilter: RecordGqlOperationFilter;
  defaultSubject?: string;
};

export const useOpenComposeCampaignInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openComposeCampaignInSidePanel = useCallback(
    (params: OpenComposeCampaignParams) => {
      const pageId = v4();

      store.set(
        composeCampaignRecipientFilterComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.recipientFilter,
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
