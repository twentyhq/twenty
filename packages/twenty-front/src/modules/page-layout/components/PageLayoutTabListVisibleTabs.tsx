import { styled } from '@linaria/react';
import { TabListRow } from '@/ui/layout/tab-list/components/TabListRow';
import { TabListItem } from '@/ui/layout/tab-list/components/TabListItem';

import { useScrollActiveTabIntoView } from '@/ui/layout/tab-list/hooks/useScrollActiveTabIntoView';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableTab } from '@/page-layout/components/PageLayoutTabListReorderableTab';
import { usePrerenderPageLayoutTabOnHover } from '@/page-layout/hooks/usePrerenderPageLayoutTabOnHover';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';

type PageLayoutTabListVisibleTabsProps = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  activeTabId: string | null;
  behaveAsLinks: boolean;
  loading?: boolean;
  onChangeTab?: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  canReorder: boolean;
  widgetDropTargetWidgetsByTabId: Map<string, PageLayoutWidget[]>;
  firstHiddenTabId: string | null;
  isScrollable: boolean;
};

const StyledTabSlot = styled.div`
  display: flex;
`;

const StyledLeadingDropTarget = styled.div`
  flex: 0 0 2px;
  margin-left: -1px;
  margin-right: -1px;
`;

export const PageLayoutTabListVisibleTabs = ({
  visibleTabs,
  visibleTabCount,
  activeTabId,
  behaveAsLinks,
  loading,
  onChangeTab,
  onSelectTab,
  canReorder,
  widgetDropTargetWidgetsByTabId,
  firstHiddenTabId,
  isScrollable,
}: PageLayoutTabListVisibleTabsProps) => {
  const { tabRowRef } = useScrollActiveTabIntoView({
    activeTabId,
    isScrollable,
  });

  const { handleTabMouseEnter, handleTabMouseLeave } =
    usePrerenderPageLayoutTabOnHover();

  if (canReorder) {
    const shownTabs = visibleTabs.slice(0, visibleTabCount);

    return (
      <TabListRow
        ref={tabRowRef}
        activeTabId={activeTabId}
        behaveAsLinks={false}
        onSelectTab={onSelectTab}
        isScrollable={isScrollable}
      >
        {shownTabs.map((tab, index) => (
          <StyledTabSlot key={tab.id}>
            <StyledLeadingDropTarget>
              <DragDropItemDropTarget
                index={index}
                droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
                orientation="vertical"
                compact
              />
            </StyledLeadingDropTarget>
            <PageLayoutTabListReorderableTab
              tab={tab}
              index={index}
              group={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
              nextTabId={shownTabs[index + 1]?.id ?? firstHiddenTabId}
              isActive={tab.id === activeTabId}
              disabled={tab.disabled ?? loading}
              widgetDropTargetWidgets={widgetDropTargetWidgetsByTabId.get(
                tab.id,
              )}
              onSelect={() => onSelectTab(tab.id)}
            />
          </StyledTabSlot>
        ))}
        <StyledLeadingDropTarget>
          <DragDropItemDropTarget
            index={visibleTabCount}
            droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
            orientation="vertical"
            compact
          />
        </StyledLeadingDropTarget>
      </TabListRow>
    );
  }

  return (
    <TabListRow
      ref={tabRowRef}
      activeTabId={activeTabId}
      behaveAsLinks={behaveAsLinks}
      onSelectTab={onSelectTab}
      isScrollable={isScrollable}
    >
      {visibleTabs.slice(0, visibleTabCount).map((tab) => (
        <TabListItem
          key={tab.id}
          tab={tab}
          mode={behaveAsLinks ? 'link' : 'tab'}
          active={tab.id === activeTabId}
          disabled={tab.disabled ?? loading}
          onSelect={behaveAsLinks ? onChangeTab : onSelectTab}
          onMouseEnter={
            tab.id === activeTabId || (tab.disabled ?? loading)
              ? undefined
              : () => handleTabMouseEnter(tab.id)
          }
          onMouseLeave={handleTabMouseLeave}
        />
      ))}
    </TabListRow>
  );
};
