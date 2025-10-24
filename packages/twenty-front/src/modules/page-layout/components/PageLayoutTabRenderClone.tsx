import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type DraggableProvided } from '@hello-pangea/dnd';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

const StyledDraggableWrapper = styled.div`
  display: flex;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const PageLayoutTabRenderClone = ({
  tab,
  provided,
  activeTabId,
}: {
  tab: SingleTabProps;
  provided: DraggableProvided;
  activeTabId: string | null;
}) => {
  const theme = useTheme();

  const pageLayoutTabListCurrentDragDroppableId = useRecoilComponentValue(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
  );

  const isHoveringTabList =
    pageLayoutTabListCurrentDragDroppableId ===
    PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS;

  if (!tab) return null;

  if (isHoveringTabList) {
    return (
      <StyledDraggableWrapper
        ref={provided.innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          cursor: 'grabbing',
        }}
      >
        <StyledTabContainer active={tab.id === activeTabId} disabled={false}>
          <TabContent
            id={tab.id}
            active={false}
            disabled={false}
            LeftIcon={tab.Icon}
            title={tab.title}
            logo={tab.logo}
            pill={tab.pill}
          />
        </StyledTabContainer>
      </StyledDraggableWrapper>
    );
  } else {
    return (
      <StyledDraggableWrapper
        id={'clone-drag-wrapper'}
        ref={provided.innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          cursor: 'grabbing',
        }}
      >
        <div
          style={{
            minWidth:
              GenericDropdownContentWidth.Medium -
              theme.spacingMultiplicator * 2,
          }}
        >
          <MenuItemSelectAvatar
            text={tab.title}
            avatar={<TabAvatar tab={tab} />}
            selected={tab.id === activeTabId}
            onClick={undefined}
            disabled
          />
        </div>
      </StyledDraggableWrapper>
    );
  }
};
