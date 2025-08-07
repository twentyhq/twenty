import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useBoardCardDragState } from '@/object-record/record-board/hooks/useBoardCardDragState';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';

import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { RecordBoardCardBody } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBody';
import { RecordBoardCardHeader } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeader';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { InView, useInView } from 'react-intersection-observer';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';
import { useDebouncedCallback } from 'use-debounce';

const StyledBoardCard = styled.div<{
  isDragging?: boolean;
  isSecondaryDragged?: boolean;
  isPrimaryMultiDrag?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;

  ${({ isSecondaryDragged }) =>
    isSecondaryDragged &&
    `
    opacity: 0.3;
  `}

  &[data-selected='true'] {
    background-color: ${({ theme }) => theme.accent.quaternary};
  }

  &[data-focused='true'] {
    background-color: ${({ theme }) => theme.background.tertiary};
  }

  &[data-active='true'] {
    background-color: ${({ theme }) => theme.accent.quaternary};
    border: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.border.color.strong};

    &[data-active='true'] {
      border: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
    }
  }

  .checkbox-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
  }

  &[data-selected='true'] .checkbox-container {
    opacity: 1;
  }

  &:hover .checkbox-container {
    opacity: 1;
  }

  .compact-icon-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

const StyledCardContainer = styled.div<{ isPrimaryMultiDrag?: boolean }>`
  position: relative;
  ${({ isPrimaryMultiDrag }) =>
    isPrimaryMultiDrag &&
    `
    transform: scale(1.02);
    z-index: 10;
  `}
`;

const StyledRecordBoardCardStackCard = styled.div<{ offset: number }>`
  position: absolute;
  top: ${({ offset }) => (offset === 1 ? 2 : (offset - 1) * 4 + 2)}px;
  left: 0;
  right: 0;
  height: 100%;
  background-color: ${({ theme }) => theme.accent.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  z-index: ${({ offset }) => -offset};
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const RecordBoardCard = () => {
  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const multiDragState = useBoardCardDragState();

  const isPrimaryMultiDrag =
    multiDragState &&
    multiDragState.isDragging &&
    recordId === multiDragState.primaryDraggedRecordId &&
    multiDragState.originalSelection.length > 1;

  const isSecondaryDragged =
    multiDragState?.isDragging &&
    multiDragState.originalSelection.includes(recordId) &&
    recordId !== multiDragState.primaryDraggedRecordId;

  const visibleFieldDefinitions = useRecoilComponentValue(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const isCompactModeActive = useRecoilComponentValue(
    isRecordBoardCompactModeActiveComponentState,
  );

  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyState(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const isCurrentCardFocused = useRecoilComponentFamilyValue(
    isRecordBoardCardFocusedComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  const isCurrentCardActive = useRecoilComponentFamilyValue(
    isRecordBoardCardActiveComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  const recordBoardId = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
  );

  const actionMenuId = getActionMenuIdFromRecordIndexId(recordBoardId);

  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const setActionMenuDropdownPosition = useSetRecoilComponentState(
    recordIndexActionMenuDropdownPositionComponentState,
    actionMenuDropdownId,
  );

  const { openDropdown } = useOpenDropdown();

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { activateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const handleContextMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCurrentCardSelected(true);
    setActionMenuDropdownPosition({
      x: event.clientX,
      y: event.clientY,
    });
    openDropdown({
      dropdownComponentInstanceIdFromProps: actionMenuDropdownId,
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleCardClick = () => {
    activateBoardCard({ rowIndex, columnIndex });
    unfocusBoardCard();
    openRecordFromIndexView({ recordId });
  };

  const onMouseLeaveBoard = useDebouncedCallback(() => {
    if (isCompactModeActive && isCardExpanded) {
      setIsCardExpanded(false);
    }
  }, 800);

  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const { ref: cardRef } = useInView({
    root: scrollWrapperHTMLElement,
    rootMargin: '1000px',
  });

  const visibleFieldDefinitionsFiltered = visibleFieldDefinitions.filter(
    (boardField) => !boardField.isLabelIdentifier,
  );

  return (
    <StyledBoardCardWrapper
      data-click-outside-id={RECORD_BOARD_CARD_CLICK_OUTSIDE_ID}
      onContextMenu={handleContextMenuOpen}
    >
      <InView>
        <StyledCardContainer isPrimaryMultiDrag={isPrimaryMultiDrag}>
          {isPrimaryMultiDrag &&
            Array.from({
              length: Math.min(5, multiDragState.originalSelection.length - 1),
            }).map((_, index) => (
              <StyledRecordBoardCardStackCard key={index} offset={index + 1} />
            ))}

          <StyledBoardCard
            ref={cardRef}
            data-selected={isCurrentCardSelected}
            data-focused={isCurrentCardFocused}
            data-active={isCurrentCardActive}
            onMouseLeave={onMouseLeaveBoard}
            onClick={handleCardClick}
            isPrimaryMultiDrag={isPrimaryMultiDrag}
            isSecondaryDragged={isSecondaryDragged}
          >
            <RecordBoardCardHeader
              isCardExpanded={isCardExpanded}
              setIsCardExpanded={setIsCardExpanded}
            />
            <AnimatedEaseInOut
              isOpen={isCardExpanded || !isCompactModeActive}
              initial={false}
            >
              <RecordBoardCardBody
                fieldDefinitions={visibleFieldDefinitionsFiltered}
              />
            </AnimatedEaseInOut>
          </StyledBoardCard>
        </StyledCardContainer>
      </InView>
    </StyledBoardCardWrapper>
  );
};
