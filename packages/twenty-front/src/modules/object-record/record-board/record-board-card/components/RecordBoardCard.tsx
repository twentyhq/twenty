import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';

import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { RecordBoardCardCellEditModePortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellEditModePortal';
import { RecordBoardCardCellHoveredPortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortal';
import { RecordBoardCardBody } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBody';
import { RecordBoardCardHeader } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeader';
import { RecordBoardCardMultiDragStack } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragStack';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { recordBoardCardIsExpandedComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardIsExpandedComponentState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';
import { useDebouncedCallback } from 'use-debounce';

const StyledCardContainer = styled.div<{ isPrimaryMultiDrag?: boolean }>`
  position: relative;
  ${({ isPrimaryMultiDrag }) =>
    isPrimaryMultiDrag &&
    `
    transform: scale(1.02);
    z-index: 10;
  `}
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const RecordBoardCard = () => {
  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const recordBoardId = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
  );

  const isRecordIdPrimaryDragMultiple = useRecoilComponentFamilyValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const isRecordIdSecondaryDragMultiple = useRecoilComponentFamilyValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const [isCardExpanded, setIsCardExpanded] = useRecoilComponentState(
    recordBoardCardIsExpandedComponentState,
    `record-board-card-${recordId}`,
  );

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

  const isDraggingThisCard =
    isRecordIdPrimaryDragMultiple || isRecordIdSecondaryDragMultiple;

  return (
    <RecordBoardCardComponentInstanceContext.Provider
      value={{
        instanceId: `record-board-card-${recordId}`,
      }}
    >
      <RecordFieldsScopeContextProvider
        value={{ scopeInstanceId: RECORD_BOARD_CARD_INPUT_ID_PREFIX }}
      >
        <StyledBoardCardWrapper
          data-click-outside-id={RECORD_BOARD_CARD_CLICK_OUTSIDE_ID}
          onContextMenu={handleContextMenuOpen}
        >
          <StyledCardContainer
            isPrimaryMultiDrag={isRecordIdPrimaryDragMultiple}
          >
            {isRecordIdPrimaryDragMultiple && <RecordBoardCardMultiDragStack />}
            <RecordCard
              data-selected={isCurrentCardSelected}
              data-focused={isCurrentCardFocused}
              data-active={isCurrentCardActive}
              onMouseLeave={onMouseLeaveBoard}
              onClick={handleCardClick}
              isPrimaryMultiDrag={isRecordIdPrimaryDragMultiple}
              isSecondaryDragged={isRecordIdSecondaryDragMultiple}
              isDragging={isDraggingThisCard}
            >
              <RecordBoardCardHeader />
              <AnimatedEaseInOut
                isOpen={isCardExpanded || !isCompactModeActive}
                initial={false}
              >
                <RecordBoardCardBody />
              </AnimatedEaseInOut>
            </RecordCard>
          </StyledCardContainer>
          <RecordBoardCardCellHoveredPortal />
          <RecordBoardCardCellEditModePortal />
        </StyledBoardCardWrapper>
      </RecordFieldsScopeContextProvider>
    </RecordBoardCardComponentInstanceContext.Provider>
  );
};
