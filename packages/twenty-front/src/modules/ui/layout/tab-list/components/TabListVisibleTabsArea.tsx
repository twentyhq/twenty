import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TAB_LIST_DROPPABLE_IDS } from '@/ui/layout/tab-list/constants/TabListDroppableIds';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { TabButton } from 'twenty-ui/input';
import { TabListDraggableTab } from './TabListDraggableTab';

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  position: relative;
  overflow: hidden;
  max-width: 100%;
`;

type TabListVisibleTabsAreaProps = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  activeTabId: string | null;
  loading?: boolean;
  isDraggable?: boolean;
  behaveAsLinks: boolean;
  onTabSelect: (tabId: string) => void;
};

export const TabListVisibleTabsArea = ({
  visibleTabs,
  visibleTabCount,
  activeTabId,
  loading,
  isDraggable,
  behaveAsLinks,
  onTabSelect,
}: TabListVisibleTabsAreaProps) => {
  if (isDraggable === true) {
    return (
      <Droppable
        droppableId={TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
        direction="horizontal"
      >
        {(provided) => (
          <StyledTabContainer
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {visibleTabs.slice(0, visibleTabCount).map((tab, index) => (
              <TabListDraggableTab
                key={tab.id}
                tab={tab}
                index={index}
                isActive={tab.id === activeTabId}
                isDisabled={tab.disabled ?? loading}
                onSelect={() => onTabSelect(tab.id)}
              />
            ))}
            {provided.placeholder}
          </StyledTabContainer>
        )}
      </Droppable>
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
          onClick={behaveAsLinks ? undefined : () => onTabSelect(tab.id)}
        />
      ))}
    </StyledTabContainer>
  );
};
