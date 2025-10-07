import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
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

  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

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
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        if (!pageLayoutDraft) return;

        const tabToDuplicate = pageLayoutDraft.tabs.find(
          (tab) => tab.id === tabId,
        );
        if (!tabToDuplicate) return;

        const currentTabIndex = pageLayoutDraft.tabs.findIndex(
          (tab) => tab.id === tabId,
        );
        const destinationIndex =
          insertAt === 'before' ? currentTabIndex : currentTabIndex + 1;

        const newPosition = calculateNewPosition({
          destinationIndex,
          sourceIndex: pageLayoutDraft.tabs.length,
          items: pageLayoutDraft.tabs,
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
          tabs: [...prev.tabs, duplicatedTab].sort(
            (a, b) => a.position - b.position,
          ),
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
      pageLayoutDraftState,
      setPageLayoutDraft,
      pageLayoutCurrentLayoutsState,
      setActiveTabId,
    ],
  );

  return { duplicatePageLayoutTab };
};
