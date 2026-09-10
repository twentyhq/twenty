import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { type PageLayoutTabMoreButtonDropData } from '@/page-layout/types/PageLayoutTabMoreButtonDropData';
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
  const moreButtonDropData: PageLayoutTabMoreButtonDropData = {
    type: 'tab-more-button',
  };

  const { ref, isDropTarget } = useDroppable({
    id: PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.MORE_BUTTON,
    accept: PAGE_LAYOUT_TAB_DND_TYPE,
    collisionDetector: pointerIntersection,
    data: moreButtonDropData,
  });

  return (
    <div ref={ref}>
      <StyledTabMoreButtonWrapper isDraggingOver={isDropTarget}>
        <TabMoreButton
          hiddenTabsCount={hiddenTabsCount}
          active={isActiveTabHidden}
        />
      </StyledTabMoreButtonWrapper>
    </div>
  );
};
