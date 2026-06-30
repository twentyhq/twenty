import { styled } from '@linaria/react';
import { Droppable } from '@hello-pangea/dnd';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageLayoutTabListDroppableMoreButtonProps = {
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
};

const StyledTabMoreButtonWrapper = styled.div<{ isDraggingOver: boolean }>`
  ${({ isDraggingOver }) =>
    isDraggingOver
      ? `
    background-color: ${themeCssVariables.background.transparent.blue};
    pointer-events: none;
  `
      : ''}
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
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          <StyledTabMoreButtonWrapper isDraggingOver={snapshot.isDraggingOver}>
            <TabMoreButton
              hiddenTabsCount={hiddenTabsCount}
              active={isActiveTabHidden}
            />
          </StyledTabMoreButtonWrapper>
        </div>
      )}
    </Droppable>
  );
};
