import { styled } from '@linaria/react';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableTab } from '@/page-layout/components/PageLayoutTabListReorderableTab';
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
  widgetDropTargetTabIds: Set<string>;
  firstHiddenTabId: string | null;
};

const StyledTabContainer = styled.div`
  display: flex;
  max-width: 100%;
  overflow: hidden;
  position: relative;

  > *:not(:last-child) {
    margin-right: ${TAB_LIST_GAP}px;
  }
`;

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
  widgetDropTargetTabIds,
  firstHiddenTabId,
}: PageLayoutTabListVisibleTabsProps) => {
  if (canReorder) {
    const shownTabs = visibleTabs.slice(0, visibleTabCount);

    return (
      <StyledTabContainer>
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
              isWidgetDropTarget={widgetDropTargetTabIds.has(tab.id)}
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
      </StyledTabContainer>
    );
  }

  return (
    <StyledTabContainer>
      {visibleTabs.slice(0, visibleTabCount).map((tab) => (
        <TabButton
          key={tab.id}
          id={tab.id}
          title={tab.title}
          LeftIcon={tab.Icon}
          logo={tab.logo}
          active={tab.id === activeTabId}
          disabled={tab.disabled ?? loading}
          pill={tab.pill}
          to={behaveAsLinks ? `#${tab.id}` : undefined}
          onClick={
            behaveAsLinks
              ? () => onChangeTab?.(tab.id)
              : () => onSelectTab(tab.id)
          }
        />
      ))}
    </StyledTabContainer>
  );
};
