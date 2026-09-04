import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useExecuteTasksOnAnyLocationChange = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const resetPageLayoutEditMode = useCallback(() => {
    const pageLayoutId = store.get(currentPageLayoutIdState.atom);

    if (isDefined(pageLayoutId)) {
      const pageLayoutPersisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );

      if (isDefined(pageLayoutPersisted)) {
        store.set(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: pageLayoutId,
            surfaceId,
          }),
          toDraftPageLayout(pageLayoutPersisted),
        );

        const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
        store.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayoutId,
            surfaceId,
          }),
          tabLayouts,
        );
      }

      store.set(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        false,
      );

      store.set(
        pageLayoutIsInitializedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        false,
      );

      store.set(
        hasInitializedFieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        {},
      );

      store.set(
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        null,
      );

      store.set(currentPageLayoutIdState.atom, null);
    }
  }, [store, surfaceId]);

  /**
   * Be careful to put idempotent tasks here.
   *
   * Because it might be called multiple times.
   */
  const executeTasksOnAnyLocationChange = () => {
    closeAnyOpenDropdown();

    const isLayoutCustomizationModeEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (!isLayoutCustomizationModeEnabled) {
      resetPageLayoutEditMode();
    }
  };

  return { executeTasksOnAnyLocationChange };
};
