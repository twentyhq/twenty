import { Draggable } from '@hello-pangea/dnd';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  isActive,
  disabled,
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  const [
    pageLayoutTabListCurrentDragDroppableId,
    setPageLayoutTabListCurrentDragDroppableId,
  ] = useRecoilComponentState(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
  );

  const isHoveringTabList =
    pageLayoutTabListCurrentDragDroppableId ===
    PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.VISIBLE_TABS;

  return (
    <Draggable draggableId={tab.id} index={index} isDragDisabled={disabled}>
      {(draggableProvided, draggableSnapshot) => (
        <StyledTabContainer
          ref={draggableProvided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.dragHandleProps}
          onClick={draggableSnapshot.isDragging ? undefined : onSelect}
          active={isActive}
          disabled={disabled}
          style={{
            ...draggableProvided.draggableProps.style,
            cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
            backgroundColor: 'green',
          }}
        >
          <TabContent
            id={tab.id}
            active={isActive}
            disabled={disabled}
            LeftIcon={tab.Icon}
            title={tab.title}
            logo={tab.logo}
            pill={tab.pill}
          />
        </StyledTabContainer>
      )}
    </Draggable>
  );
};
