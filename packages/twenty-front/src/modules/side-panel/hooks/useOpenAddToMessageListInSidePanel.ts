import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  type RecordGqlOperationFilter,
  SidePanelPages,
} from 'twenty-shared/types';
import { IconUsersGroup } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { addToMessageListPersonFilterComponentState } from '@/side-panel/pages/add-to-message-list/states/addToMessageListPersonFilterComponentState';

export const useOpenAddToMessageListInSidePanel = () => {
  const { t } = useLingui();
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
        pageTitle: t`Add to list`,
        pageIcon: IconUsersGroup,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openAddToMessageListInSidePanel };
};
