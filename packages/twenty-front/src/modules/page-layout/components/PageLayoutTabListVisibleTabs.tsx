import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableTab } from '@/page-layout/components/PageLayoutTabListReorderableTab';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { type PageLayoutTabListEndDropData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';

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

// Catches drops after the last visible tab; inserting before the first hidden
// tab keeps the dropped tab visible instead of sending it to the overflow.
const StyledEndDropZone = styled.div`
  align-self: stretch;
  flex: 0 0 ${TAB_LIST_GAP * 2}px;
  position: relative;
`;

const PageLayoutTabListVisibleTabsEndDropZone = ({
  firstHiddenTabId,
}: {
  firstHiddenTabId: string | null;
}) => {
  const endDropData: PageLayoutTabListEndDropData = {
    type: 'tab-list-end',
    beforeTabId: firstHiddenTabId,
  };

  const { ref, isDropTarget } = useDroppable({
    id: `${PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}-end`,
    accept: PAGE_LAYOUT_TAB_DND_TYPE,
    collisionDetector: pointerIntersection,
    data: endDropData,
  });

  return (
    <StyledEndDropZone ref={ref}>
      {isDropTarget && <DragDropItemDropLine orientation="vertical" />}
    </StyledEndDropZone>
  );
};

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
    return (
      <StyledTabContainer>
        {visibleTabs.slice(0, visibleTabCount).map((tab, index) => (
          <PageLayoutTabListReorderableTab
            key={tab.id}
            tab={tab}
            index={index}
            group={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
            isActive={tab.id === activeTabId}
            disabled={tab.disabled ?? loading}
            isWidgetDropTarget={widgetDropTargetTabIds.has(tab.id)}
            onSelect={() => onSelectTab(tab.id)}
          />
        ))}
        <PageLayoutTabListVisibleTabsEndDropZone
          firstHiddenTabId={firstHiddenTabId}
        />
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
