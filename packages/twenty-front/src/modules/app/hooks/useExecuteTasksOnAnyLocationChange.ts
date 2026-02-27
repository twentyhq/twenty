import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
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
import { useStore } from 'jotai';

export const useExecuteTasksOnAnyLocationChange = () => {
  const store = useStore();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const resetPageLayoutEditMode = useCallback(() => {
    const pageLayoutId = store.get(currentPageLayoutIdState.atom);

    if (isDefined(pageLayoutId)) {
      const pageLayoutPersisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      if (isDefined(pageLayoutPersisted)) {
        store.set(
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
        store.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          tabLayouts,
        );
      }

      store.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        false,
      );

      store.set(
        pageLayoutIsInitializedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        false,
      );

      store.set(
        hasInitializedFieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        {},
      );

      store.set(currentPageLayoutIdState.atom, null);
    }

    store.set(
      contextStoreIsPageInEditModeComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      false,
    );
  }, [store]);

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
