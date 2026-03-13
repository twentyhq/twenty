import { useExitLayoutCustomizationMode } from '@/app/hooks/useExitLayoutCustomizationMode';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { activeCustomizationPageLayoutIdsState } from '@/app/states/activeCustomizationPageLayoutIdsState';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCancelLayoutCustomization = () => {
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
        }),
      );

      if (isDefined(persisted)) {
        store.set(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          {
            id: persisted.id,
            name: persisted.name,
            type: persisted.type,
            objectMetadataId: persisted.objectMetadataId,
            tabs: persisted.tabs,
            defaultTabToFocusOnMobileAndSidePanelId:
              persisted.defaultTabToFocusOnMobileAndSidePanelId,
          } satisfies DraftPageLayout,
        );

        store.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          convertPageLayoutToTabLayouts(persisted),
        );
      }

      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      store.set(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        fieldsWidgetGroupsPersisted,
      );

      const fieldsWidgetUngroupedFieldsPersisted = store.get(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      store.set(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        fieldsWidgetUngroupedFieldsPersisted,
      );

      const fieldsWidgetEditorModePersisted = store.get(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      store.set(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        fieldsWidgetEditorModePersisted,
      );
    }

    exitLayoutCustomizationMode();
  }, [store, exitLayoutCustomizationMode]);

  return { cancel };
};
