import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { createRelatedRecordTargetComponentState } from '@/side-panel/pages/create-related-record/states/createRelatedRecordTargetComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useOpenCreateRelatedRecordInSidePanel = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openCreateRelatedRecordInSidePanel = useCallback(
    (targetRecord: ActivityTargetableObject) => {
      const pageId = v4();

      store.set(
        createRelatedRecordTargetComponentState.atomFamily({
          instanceId: pageId,
          surfaceId,
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
    [navigateSidePanelMenu, store, surfaceId],
  );

  return { openCreateRelatedRecordInSidePanel };
};
