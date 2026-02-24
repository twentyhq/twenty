import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
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

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    componentInstanceId,
  );

  const pageLayoutPersistedState = useRecoilComponentStateCallbackStateV2(
    pageLayoutPersistedComponentState,
    componentInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutCurrentLayoutsComponentState,
    componentInstanceId,
  );

  const activeTabIdAtom = activeTabIdComponentState.atomFamily({
    instanceId: tabListComponentInstanceId,
  });

  const fieldsWidgetGroupsDraftState = useRecoilComponentStateCallbackStateV2(
    fieldsWidgetGroupsDraftComponentState,
    componentInstanceId,
  );

  const fieldsWidgetGroupsPersistedState =
    useRecoilComponentStateCallbackStateV2(
      fieldsWidgetGroupsPersistedComponentState,
      componentInstanceId,
    );

  const resetDraftPageLayoutToPersistedPageLayout = useCallback(() => {
    const pageLayoutPersisted = store.get(pageLayoutPersistedState);

    if (isDefined(pageLayoutPersisted)) {
      const currentActiveTabId = store.get(activeTabIdAtom);

      const persistedTabIds = pageLayoutPersisted.tabs.map((tab) => tab.id);
      const isActiveTabInPersistedTabs =
        currentActiveTabId && persistedTabIds.includes(currentActiveTabId);

      if (!isActiveTabInPersistedTabs && pageLayoutPersisted.tabs.length > 0) {
        store.set(activeTabIdAtom, pageLayoutPersisted.tabs[0].id);
      }

      store.set(pageLayoutDraftState, {
        id: pageLayoutPersisted.id,
        name: pageLayoutPersisted.name,
        type: pageLayoutPersisted.type,
        objectMetadataId: pageLayoutPersisted.objectMetadataId,
        tabs: pageLayoutPersisted.tabs,
      });

      const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
      store.set(pageLayoutCurrentLayoutsState, tabLayouts);

      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedState,
      );
      store.set(fieldsWidgetGroupsDraftState, fieldsWidgetGroupsPersisted);
    }
  }, [
    pageLayoutDraftState,
    pageLayoutPersistedState,
    pageLayoutCurrentLayoutsState,
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    activeTabIdAtom,
    store,
  ]);

  return {
    resetDraftPageLayoutToPersistedPageLayout,
  };
};
