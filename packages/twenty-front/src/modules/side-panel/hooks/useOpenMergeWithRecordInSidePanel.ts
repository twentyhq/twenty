import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconArrowMerge } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { mergeWithRecordSourceComponentState } from '@/side-panel/pages/merge-with-record/states/mergeWithRecordSourceComponentState';
import { type MergeWithRecordSource } from '@/side-panel/pages/merge-with-record/types/MergeWithRecordSource';

export const useOpenMergeWithRecordInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openMergeWithRecordInSidePanel = useCallback(
    (mergeWithRecordSource: MergeWithRecordSource) => {
      const pageId = v4();

      store.set(
        mergeWithRecordSourceComponentState.atomFamily({ instanceId: pageId }),
        mergeWithRecordSource,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.MergeWithRecord,
        pageTitle: t`Merge with`,
        pageIcon: IconArrowMerge,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openMergeWithRecordInSidePanel };
};
