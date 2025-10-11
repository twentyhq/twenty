import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';

type PageLayoutTabListDroppableMoreButtonProps = {
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
};

const StyledTabMoreButton = styled(TabMoreButton)<{ isDraggingOver: boolean }>`
  ${({ isDraggingOver, theme }) =>
    isDraggingOver &&
    `
    background-color: ${theme.background.transparent.blue};
    pointer-events: none;
  `}
`;

export const PageLayoutTabListDroppableMoreButton = ({
  hiddenTabsCount,
  isActiveTabHidden,
}: PageLayoutTabListDroppableMoreButtonProps) => {
  return (
    <Droppable droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.MORE_BUTTON}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          <StyledTabMoreButton
            hiddenTabsCount={hiddenTabsCount}
            active={isActiveTabHidden}
            isDraggingOver={snapshot.isDraggingOver}
          />
        </div>
      )}
    </Droppable>
  );
};
