import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRichTextComponentState } from '@/side-panel/pages/rich-text-page/states/viewableRichTextComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const useOpenRichTextInSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanelMenu, openSidePanelMenu } = useSidePanelMenu();

  const store = useStore();

  const openRichTextInSidePanel = useCallback(
    (recordId: string, objectNameSingular: string, fieldName?: string) => {
      store.set(viewableRichTextComponentState.atom, {
        recordId,
        objectNameSingular,
        fieldName: fieldName ?? 'bodyV2',
      });

      openSidePanelMenu();
      navigateSidePanelMenu({
        page: SidePanelPages.EditRichText,
        pageTitle: t`Rich Text`,
        pageIcon: IconPencil,
      });
    },
    [navigateSidePanelMenu, openSidePanelMenu, store, t],
  );

  return {
    openRichTextInSidePanel,
  };
};
