import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useExecuteTasksOnAnyLocationChange = () => {
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const resetPageLayoutEditMode = useCallback(() => {
    const pageLayoutId = jotaiStore.get(currentPageLayoutIdState.atom);

    if (isDefined(pageLayoutId)) {
      const pageLayoutPersisted = jotaiStore.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      if (isDefined(pageLayoutPersisted)) {
        jotaiStore.set(
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

        const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
        jotaiStore.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          tabLayouts,
        );
      }

      jotaiStore.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        false,
      );

      jotaiStore.set(
        pageLayoutIsInitializedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        false,
      );

      jotaiStore.set(
        hasInitializedFieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        {},
      );

      jotaiStore.set(currentPageLayoutIdState.atom, null);
    }

    jotaiStore.set(
      contextStoreIsPageInEditModeComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      false,
    );
  }, []);

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
