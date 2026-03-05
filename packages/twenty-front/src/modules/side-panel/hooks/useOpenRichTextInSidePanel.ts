import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRichTextComponentState } from '@/side-panel/pages/rich-text-page/states/viewableRichTextComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil } from 'twenty-ui/display';

export const useOpenRichTextInSidePanel = () => {
  const { navigateSidePanelMenu, openSidePanelMenu } = useSidePanelMenu();

  const store = useStore();

  const openRichTextInSidePanel = useCallback(
    (activityId: string, activityObjectNameSingular: string) => {
      store.set(viewableRichTextComponentState.atom, {
        activityId,
        activityObjectNameSingular,
      });

      openSidePanelMenu();
      navigateSidePanelMenu({
        page: SidePanelPages.EditRichText,
        pageTitle: t`Rich Text`,
        pageIcon: IconPencil,
      });
    },
    [navigateSidePanelMenu, openSidePanelMenu, store],
  );

  return {
    openRichTextInSidePanel,
  };
};
