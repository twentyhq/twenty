import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  SidePanelPages,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { IconUserPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { addToMessageListPersonFilterComponentState } from '@/side-panel/pages/add-to-message-list/states/addToMessageListPersonFilterComponentState';

export const useOpenAddToMessageListInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAddToMessageListInSidePanel = useCallback(
    (personFilter: RecordGqlOperationFilter) => {
      const pageId = v4();

      store.set(
        addToMessageListPersonFilterComponentState.atomFamily({
          instanceId: pageId,
        }),
        personFilter,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.AddToMessageList,
        pageTitle: t`Add to List`,
        pageIcon: IconUserPlus,
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openAddToMessageListInSidePanel };
};
