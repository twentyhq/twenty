import { styled } from '@linaria/react';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableTab } from '@/page-layout/components/PageLayoutTabListReorderableTab';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { PAGE_LAYOUT_TAB_LIST_END_DROP_ZONE_WIDTH } from '@/page-layout/constants/PageLayoutTabListEndDropZoneWidth';
import { type PageLayoutTabListEndDropData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';

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
// Its width is reserved by PageLayoutTabList's container measurement.
const StyledEndDropZone = styled(DragDropItemEndDropZone)`
  align-self: stretch;
  flex: 0 0 ${PAGE_LAYOUT_TAB_LIST_END_DROP_ZONE_WIDTH}px;
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
    const endDropData: PageLayoutTabListEndDropData = {
      type: 'tab-list-end',
      beforeTabId: firstHiddenTabId,
    };

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
        <StyledEndDropZone
          id={`${PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}-end`}
          accept={PAGE_LAYOUT_TAB_DND_TYPE}
          data={endDropData}
          dropLine="vertical"
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
