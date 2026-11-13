import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import {
  type EditColumnRequest,
  editColumnRequestComponentState,
} from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenEditColumnInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openEditColumnInSidePanel = useCallback(
    (editColumnRequest: EditColumnRequest) => {
      const pageId = v4();

      store.set(
        editColumnRequestComponentState.atomFamily({ instanceId: pageId }),
        editColumnRequest,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.EditColumn,
        pageTitle: t`Edit column`,
        pageIcon: IconEdit,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openEditColumnInSidePanel };
};
