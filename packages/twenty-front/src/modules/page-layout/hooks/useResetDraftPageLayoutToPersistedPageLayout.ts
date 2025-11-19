import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useResetDraftPageLayoutToPersistedPageLayout = (
  pageLayoutIdFromProps?: string,
) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const tabListComponentInstanceId =
    getTabListInstanceIdFromPageLayoutId(componentInstanceId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    componentInstanceId,
  );

  const pageLayoutPersistedState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    componentInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    componentInstanceId,
  );

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListComponentInstanceId,
  );

  const resetDraftPageLayoutToPersistedPageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const pageLayoutPersisted = snapshot
          .getLoadable(pageLayoutPersistedState)
          .getValue();

        if (isDefined(pageLayoutPersisted)) {
          const currentActiveTabId = snapshot
            .getLoadable(activeTabIdState)
            .getValue();

          const persistedTabIds = pageLayoutPersisted.tabs.map((tab) => tab.id);
          const isActiveTabInPersistedTabs =
            currentActiveTabId && persistedTabIds.includes(currentActiveTabId);

          if (
            !isActiveTabInPersistedTabs &&
            pageLayoutPersisted.tabs.length > 0
          ) {
            set(activeTabIdState, pageLayoutPersisted.tabs[0].id);
          }

          set(pageLayoutDraftState, {
            id: pageLayoutPersisted.id,
            name: pageLayoutPersisted.name,
            type: pageLayoutPersisted.type,
            objectMetadataId: pageLayoutPersisted.objectMetadataId,
            tabs: pageLayoutPersisted.tabs,
          });

          const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
          set(pageLayoutCurrentLayoutsState, tabLayouts);
        }
      },
    [
      pageLayoutDraftState,
      pageLayoutPersistedState,
      pageLayoutCurrentLayoutsState,
      activeTabIdState,
    ],
  );

  return {
    resetDraftPageLayoutToPersistedPageLayout,
  };
};
