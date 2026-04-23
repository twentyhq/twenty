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
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useRemoveDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useRemoveDraftViewForRecordTableWidget';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const useCancelLayoutCustomization = () => {
  const store = useStore();
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();
  const { removeDraftViewForRecordTableWidget } =
    useRemoveDraftViewForRecordTableWidget();

  const cancel = useCallback(() => {
    const activePageLayoutIds = store.get(
      activeCustomizationPageLayoutIdsState.atom,
    );

    for (const pageLayoutId of activePageLayoutIds) {
      const draft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const persisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const persistedWidgetIds = new Set(
        persisted?.tabs.flatMap((tab) =>
          tab.widgets.map((widget) => widget.id),
        ) ?? [],
      );

      const pendingRecordTableViewIds = draft.tabs
        .flatMap((tab) => tab.widgets)
        .filter(
          (widget) =>
            widget.type === WidgetType.RECORD_TABLE &&
            !persistedWidgetIds.has(widget.id),
        )
        .map((widget) => getWidgetConfigurationViewId(widget.configuration))
        .filter(isDefined);

      for (const viewId of pendingRecordTableViewIds) {
        removeDraftViewForRecordTableWidget(viewId);
      }

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
  }, [store, exitLayoutCustomizationMode, removeDraftViewForRecordTableWidget]);

  return { cancel };
};
