import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const useDuplicatePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { currentPageLayout } = useCurrentPageLayout();
  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const duplicatePageLayoutTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (tabId: string, insertAt: 'before' | 'after') => {
        if (!currentPageLayout) return;

        const sortedTabs = [...currentPageLayout.tabs].sort(
          (a, b) => a.position - b.position,
        );

        const tabToDuplicate = sortedTabs.find((tab) => tab.id === tabId);
        if (!tabToDuplicate) return;

        const currentTabIndex = sortedTabs.findIndex((tab) => tab.id === tabId);
        const destinationIndex =
          insertAt === 'before' ? currentTabIndex : currentTabIndex + 1;

        const newPosition = calculateNewPosition({
          destinationIndex,
          sourceIndex: sortedTabs.length,
          items: sortedTabs,
        });

        const clonedTab = structuredClone(tabToDuplicate);

        const newTabId = uuidv4();
        const oldToNewWidgetIdMap = new Map<string, string>();

        const duplicatedTab = {
          ...clonedTab,
          id: newTabId,
          title: `${clonedTab.title} (Copy)`,
          position: newPosition,
          widgets: clonedTab.widgets.map((widget) => {
            const newWidgetId = uuidv4();
            oldToNewWidgetIdMap.set(widget.id, newWidgetId);
            return {
              ...widget,
              id: newWidgetId,
              pageLayoutTabId: newTabId,
            };
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPageLayoutDraft((prev) => ({
          ...prev,
          tabs: [...prev.tabs, duplicatedTab],
        }));

        const currentLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const originalTabLayout = currentLayouts[tabId];

        if (isDefined(originalTabLayout)) {
          const remappedLayout = {
            desktop: originalTabLayout.desktop?.map((item) => ({
              ...item,
              i: oldToNewWidgetIdMap.get(item.i) || item.i,
            })),
            mobile: originalTabLayout.mobile?.map((item) => ({
              ...item,
              i: oldToNewWidgetIdMap.get(item.i) || item.i,
            })),
          };

          set(pageLayoutCurrentLayoutsState, (prev) => ({
            ...prev,
            [newTabId]: remappedLayout,
          }));
        }

        setActiveTabId(newTabId);
      },
    [
      currentPageLayout,
      setPageLayoutDraft,
      pageLayoutCurrentLayoutsState,
      setActiveTabId,
    ],
  );

  return { duplicatePageLayoutTab };
};
