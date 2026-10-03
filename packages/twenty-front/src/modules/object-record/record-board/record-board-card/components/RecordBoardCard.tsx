import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';

import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { RecordBoardCardCellEditModePortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellEditModePortal';
import { RecordBoardCardCellHoveredPortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortal';
import { RecordBoardCardBody } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBody';
import { RecordBoardCardHeader } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeader';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { recordBoardCardIsExpandedComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardIsExpandedComponentState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { RecordDragMultiDragStack } from '@/object-record/record-drag/components/RecordDragMultiDragStack';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useDisableDragSelectOnPointerDown } from '@/ui/utilities/drag-select/hooks/useDisableDragSelectOnPointerDown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

const StyledCardContainer = styled.div<{ isPrimaryMultiDrag?: boolean }>`
  position: relative;
  transform: ${({ isPrimaryMultiDrag }) =>
    isPrimaryMultiDrag ? 'scale(1.02)' : 'none'};
  z-index: ${({ isPrimaryMultiDrag }) => (isPrimaryMultiDrag ? '10' : 'auto')};
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const RecordBoardCard = () => {
  const { recordId, rowIndex, columnIndex, isDragOverlay } = useContext(
    RecordBoardCardContext,
  );

  const recordBoardId = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
  );

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const primaryDraggedRecordId = useAtomComponentStateValue(
    primaryDraggedRecordIdComponentState,
  );

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const [recordBoardCardIsExpanded, setRecordBoardCardIsExpanded] =
    useAtomComponentState(
      recordBoardCardIsExpandedComponentState,
      `record-board-card-${recordId}`,
    );

  const isRecordSelected = useAtomComponentFamilyStateValue(
    isRecordSelectedComponentFamilyState,
    recordId,
  );

  const isRecordBoardCardFocused = useAtomComponentFamilyStateValue(
    isRecordBoardCardFocusedComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  const isRecordBoardCardActive = useAtomComponentFamilyStateValue(
    isRecordBoardCardActiveComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  const { openRecordContextMenu } = useOpenRecordContextMenu();

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { activateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const {
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  } = useDisableDragSelectOnPointerDown();

  const handleContextMenuOpen = (event: React.MouseEvent) => {
    openRecordContextMenu({ event, recordId });
  };

  const handleCardClick = () => {
    activateBoardCard({ rowIndex, columnIndex });
    unfocusBoardCard();
    openRecordFromIndexView({ recordId });
  };

  const onMouseLeaveBoard = useDebouncedCallback(() => {
    if (isCompactModeActive && recordBoardCardIsExpanded) {
      setRecordBoardCardIsExpanded(false);
    }
  }, 800);

  const isDraggingThisCard =
    !isDragOverlay &&
    (isRecordIdPrimaryDragMultiple ||
      isRecordIdSecondaryDragMultiple ||
      primaryDraggedRecordId === recordId);

  return (
    <RecordBoardCardComponentInstanceContext.Provider
      value={{
        instanceId: `record-board-card-${recordId}`,
      }}
    >
      <StyledBoardCardWrapper
        data-click-outside-id={RECORD_BOARD_CARD_CLICK_OUTSIDE_ID}
        onContextMenu={handleContextMenuOpen}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <StyledCardContainer
          isPrimaryMultiDrag={isDragOverlay && isRecordIdPrimaryDragMultiple}
        >
          {isDragOverlay && isRecordIdPrimaryDragMultiple && (
            <RecordDragMultiDragStack />
          )}
          <RecordCard
            data-selected={isRecordSelected}
            data-focused={isRecordBoardCardFocused}
            data-active={isRecordBoardCardActive}
            onMouseLeave={onMouseLeaveBoard}
            onClick={handleCardClick}
            isDragging={isDraggingThisCard}
          >
            <RecordBoardCardHeader />
            <Collapsible
              isExpanded={recordBoardCardIsExpanded || !isCompactModeActive}
            >
              <RecordBoardCardBody />
            </Collapsible>
          </RecordCard>
        </StyledCardContainer>
        {!isDragOverlay && (
          <>
            <RecordBoardCardCellHoveredPortal />
            <RecordBoardCardCellEditModePortal />
          </>
        )}
      </StyledBoardCardWrapper>
    </RecordBoardCardComponentInstanceContext.Provider>
  );
};
