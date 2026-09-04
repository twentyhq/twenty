import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useCancelLayoutCustomization = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();

  const cancel = useCallback(() => {
    const activePageLayoutIds = store.get(
      activeCustomizationPageLayoutIdsState.atom,
    );

    for (const pageLayoutId of activePageLayoutIds) {
      const persisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );

      if (isDefined(persisted)) {
        store.set(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: pageLayoutId,
            surfaceId,
          }),
          toDraftPageLayout(persisted),
        );

        store.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayoutId,
            surfaceId,
          }),
          convertPageLayoutToTabLayouts(persisted),
        );
      }

      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      store.set(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        fieldsWidgetGroupsPersisted,
      );

      const fieldsWidgetUngroupedFieldsPersisted = store.get(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      store.set(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        fieldsWidgetUngroupedFieldsPersisted,
      );

      const fieldsWidgetEditorModePersisted = store.get(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      store.set(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        fieldsWidgetEditorModePersisted,
      );

      const recordTableWidgetViewPersisted = store.get(
        recordTableWidgetViewPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      store.set(
        recordTableWidgetViewDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
        recordTableWidgetViewPersisted,
      );
    }

    exitLayoutCustomizationMode();
  }, [store, exitLayoutCustomizationMode, surfaceId]);

  return { cancel };
};
