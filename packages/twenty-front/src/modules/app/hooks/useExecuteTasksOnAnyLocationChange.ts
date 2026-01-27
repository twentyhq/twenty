import { useRecoilCallback } from 'recoil';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { isDefined } from 'twenty-shared/utils';

export const useExecuteTasksOnAnyLocationChange = () => {
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const resetPageLayoutEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const pageLayoutId = snapshot
          .getLoadable(currentPageLayoutIdState)
          .getValue();

        if (isDefined(pageLayoutId)) {
          const pageLayoutPersisted = snapshot
            .getLoadable(
              pageLayoutPersistedComponentState.atomFamily({
                instanceId: pageLayoutId,
              }),
            )
            .getValue();

          if (isDefined(pageLayoutPersisted)) {
            set(
              pageLayoutDraftComponentState.atomFamily({
                instanceId: pageLayoutId,
              }),
              {
                id: pageLayoutPersisted.id,
                name: pageLayoutPersisted.name,
                type: pageLayoutPersisted.type,
                objectMetadataId: pageLayoutPersisted.objectMetadataId,
                tabs: pageLayoutPersisted.tabs,
              },
            );

            const tabLayouts =
              convertPageLayoutToTabLayouts(pageLayoutPersisted);
            set(
              pageLayoutCurrentLayoutsComponentState.atomFamily({
                instanceId: pageLayoutId,
              }),
              tabLayouts,
            );
          }

          set(
            isPageLayoutInEditModeComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
            false,
          );

          set(
            pageLayoutIsInitializedComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
            false,
          );

          set(currentPageLayoutIdState, null);
        }

        set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          false,
        );
      },
    [],
  );

  /**
   * Be careful to put idempotent tasks here.
   *
   * Because it might be called multiple times.
   */
  const executeTasksOnAnyLocationChange = () => {
    closeAnyOpenDropdown();
    resetPageLayoutEditMode();
  };

  return { executeTasksOnAnyLocationChange };
};
