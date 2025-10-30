import styled from '@emotion/styled';
import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableTab } from '@/page-layout/components/PageLayoutTabListReorderableTab';
import { PageLayoutTabRenderClone } from '@/page-layout/components/PageLayoutTabRenderClone';

type PageLayoutTabListVisibleTabsProps = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  activeTabId: string | null;
  behaveAsLinks: boolean;
  loading?: boolean;
  onChangeTab?: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  canReorder: boolean;
};

const StyledTabContainer = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  max-width: 100%;

  > *:not(:last-child) {
    margin-right: ${TAB_LIST_GAP}px;
  }
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
}: PageLayoutTabListVisibleTabsProps) => {
  if (canReorder) {
    return (
      <Droppable
        droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS}
        direction="horizontal"
        renderClone={(
          provided: DraggableProvided,
          _snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric,
        ) => {
          const tab = visibleTabs[rubric.source.index];

          return (
            <PageLayoutTabRenderClone
              provided={provided}
              tab={tab}
              activeTabId={activeTabId}
            />
          );
        }}
      >
        {(provided) => (
          <StyledTabContainer
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {visibleTabs.slice(0, visibleTabCount).map((tab, index) => (
              <PageLayoutTabListReorderableTab
                key={tab.id}
                tab={tab}
                index={index}
                isActive={tab.id === activeTabId}
                disabled={tab.disabled ?? loading}
                onSelect={() => onSelectTab(tab.id)}
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
