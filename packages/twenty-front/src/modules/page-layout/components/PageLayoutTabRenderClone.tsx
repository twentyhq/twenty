import { isDefined } from 'twenty-shared/utils';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type DraggableProvided } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';
import { ThemeContext } from 'twenty-ui/theme-constants';
const StyledDraggableWrapper = styled.div`
  cursor: grab;
  display: flex;

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
  const { theme } = useContext(ThemeContext);
  const pageLayoutTabListCurrentDragDroppableId = useAtomComponentStateValue(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
  );

  const isHoveringTabList =
    pageLayoutTabListCurrentDragDroppableId !==
    PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS;

  if (!isDefined(tab)) return null;

  if (isHoveringTabList) {
    return (
      <StyledDraggableWrapper
        ref={provided.innerRef}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // oxlint-disable-next-line react/jsx-props-no-spreading
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
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // oxlint-disable-next-line react/jsx-props-no-spreading
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
