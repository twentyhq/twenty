import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { createRelatedRecordTargetComponentState } from '@/side-panel/pages/create-related-record/states/createRelatedRecordTargetComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { useLingui } from '@lingui/react/macro';

export const useOpenCreateRelatedRecordInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openCreateRelatedRecordInSidePanel = useCallback(
    (targetRecord: ActivityTargetableObject) => {
      const pageId = v4();

      store.set(
        createRelatedRecordTargetComponentState.atomFamily({
          instanceId: pageId,
        }),
        targetRecord,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.CreateRelatedRecord,
        pageTitle: t`Create related`,
        pageIcon: IconPlus,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openCreateRelatedRecordInSidePanel };
};
