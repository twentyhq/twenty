import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.background.primary};
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);
  const { handleReorderTabs } = useReorderPageLayoutTabs(currentPageLayout?.id);
  const { setPageLayoutDraft } = usePageLayoutDraftState(currentPageLayout?.id);

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    currentPageLayout?.id,
  );

  const tabListInstanceId = currentPageLayout
    ? getTabListInstanceIdFromPageLayoutId(currentPageLayout.id)
    : '';

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const handleAddTab = isPageLayoutInEditMode ? createPageLayoutTab : undefined;

  const handleDuplicate = useRecoilCallback(
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

  const handleDelete = useRecoilCallback(
    ({ snapshot, set }) =>
      (tabId: string) => {
        if (!currentPageLayout) return;

        const sortedTabs = [...currentPageLayout.tabs].sort(
          (a, b) => a.position - b.position,
        );

        if (sortedTabs.length <= 1) return;

        const tabIndex = sortedTabs.findIndex((tab) => tab.id === tabId);
        const currentActiveTabId = snapshot
          .getLoadable(activeTabIdState)
          .getValue();

        setPageLayoutDraft((prev) => ({
          ...prev,
          tabs: prev.tabs.filter((tab) => tab.id !== tabId),
        }));

        set(pageLayoutCurrentLayoutsState, (prev) => {
          const { [tabId]: _removed, ...remaining } = prev;
          return remaining;
        });

        if (currentActiveTabId === tabId) {
          const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
          const remainingTabs = sortedTabs.filter((tab) => tab.id !== tabId);
          const newActiveTab = remainingTabs[newActiveIndex];
          if (isDefined(newActiveTab)) {
            setActiveTabId(newActiveTab.id);
          }
        }
      },
    [
      currentPageLayout,
      activeTabIdState,
      setPageLayoutDraft,
      pageLayoutCurrentLayoutsState,
      setActiveTabId,
    ],
  );

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const sortedTabs = [...currentPageLayout.tabs].sort(
    (a, b) => a.position - b.position,
  );

  const tabActions = isPageLayoutInEditMode
    ? {
        onRename: (tabId: string, newTitle: string) => {
          setPageLayoutDraft((prev) => ({
            ...prev,
            tabs: prev.tabs.map((tab) =>
              tab.id === tabId ? { ...tab, title: newTitle } : tab,
            ),
          }));
        },
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
        canDelete: () => sortedTabs.length > 1,
      }
    : undefined;

  return (
    <StyledContainer>
      <StyledTabList
        tabs={sortedTabs}
        behaveAsLinks={false}
        componentInstanceId={tabListInstanceId}
        onAddTab={handleAddTab}
        isDraggable={isPageLayoutInEditMode}
        onDragEnd={isPageLayoutInEditMode ? handleReorderTabs : undefined}
        tabActions={tabActions}
      />
      <StyledScrollWrapper
        componentInstanceId={`scroll-wrapper-page-layout-${currentPageLayout.id}`}
        defaultEnableXScroll={false}
      >
        <PageLayoutGridLayout />
      </StyledScrollWrapper>
    </StyledContainer>
  );
};
