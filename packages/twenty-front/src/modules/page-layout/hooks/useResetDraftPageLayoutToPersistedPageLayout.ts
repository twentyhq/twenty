import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
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
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useResetDraftPageLayoutToPersistedPageLayout = (
  pageLayoutIdFromProps?: string,
) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const store = useStore();
  const tabListComponentInstanceId =
    getTabListInstanceIdFromPageLayoutId(componentInstanceId);

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    componentInstanceId,
  );

  const pageLayoutPersistedState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    componentInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    componentInstanceId,
  );

  const activeTabId = activeTabIdComponentState.atomFamily({
    instanceId: tabListComponentInstanceId,
  });

  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    componentInstanceId,
  );

  const fieldsWidgetGroupsPersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    componentInstanceId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      componentInstanceId,
    );

  const fieldsWidgetUngroupedFieldsPersistedState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsPersistedComponentState,
      componentInstanceId,
    );

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    componentInstanceId,
  );

  const fieldsWidgetEditorModePersistedState =
    useAtomComponentStateCallbackState(
      fieldsWidgetEditorModePersistedComponentState,
      componentInstanceId,
    );

  const resetDraftPageLayoutToPersistedPageLayout = useCallback(() => {
    const pageLayoutPersisted = store.get(pageLayoutPersistedState);

    if (isDefined(pageLayoutPersisted)) {
      const currentActiveTabId = store.get(activeTabId);

      const persistedTabIds = pageLayoutPersisted.tabs.map((tab) => tab.id);
      const isActiveTabInPersistedTabs =
        isDefined(currentActiveTabId) &&
        persistedTabIds.includes(currentActiveTabId);

      if (!isActiveTabInPersistedTabs && pageLayoutPersisted.tabs.length > 0) {
        store.set(activeTabId, pageLayoutPersisted.tabs[0].id);
      }

      const persistedAsDraft: DraftPageLayout = {
        id: pageLayoutPersisted.id,
        name: pageLayoutPersisted.name,
        type: pageLayoutPersisted.type,
        objectMetadataId: pageLayoutPersisted.objectMetadataId,
        tabs: pageLayoutPersisted.tabs,
        defaultTabToFocusOnMobileAndSidePanelId:
          pageLayoutPersisted.defaultTabToFocusOnMobileAndSidePanelId,
      };
      store.set(pageLayoutDraftState, persistedAsDraft);

      const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
      store.set(pageLayoutCurrentLayoutsState, tabLayouts);

      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedState,
      );
      store.set(fieldsWidgetGroupsDraftState, fieldsWidgetGroupsPersisted);

      const fieldsWidgetUngroupedFieldsPersisted = store.get(
        fieldsWidgetUngroupedFieldsPersistedState,
      );
      store.set(
        fieldsWidgetUngroupedFieldsDraftState,
        fieldsWidgetUngroupedFieldsPersisted,
      );

      const fieldsWidgetEditorModePersisted = store.get(
        fieldsWidgetEditorModePersistedState,
      );
      store.set(
        fieldsWidgetEditorModeDraftState,
        fieldsWidgetEditorModePersisted,
      );
    }
  }, [
    pageLayoutDraftState,
    pageLayoutPersistedState,
    pageLayoutCurrentLayoutsState,
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    fieldsWidgetUngroupedFieldsDraftState,
    fieldsWidgetUngroupedFieldsPersistedState,
    fieldsWidgetEditorModeDraftState,
    fieldsWidgetEditorModePersistedState,
    activeTabId,
    store,
  ]);

  return {
    resetDraftPageLayoutToPersistedPageLayout,
  };
};
