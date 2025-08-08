import styled from '@emotion/styled';
import {
  DragDropContext,
  DragStart,
  OnDragEndResponder,
} from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useContext, useRef } from 'react';
import { useRecoilCallback } from 'recoil';

import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/action-menu/constants/ActionMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardScrollToFocusedCardEffect } from '@/object-record/record-board/components/RecordBoardScrollToFocusedCardEffect';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-board/constants/RecordBoardClickOutsideListenerId';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useBoardCardDragState } from '@/object-record/record-board/hooks/useBoardCardDragState';
import { useEndBoardCardDrag } from '@/object-record/record-board/hooks/useEndBoardCardDrag';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardDragOperations } from '@/object-record/record-board/hooks/useRecordBoardDragOperations';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useStartBoardCardDrag } from '@/object-record/record-board/hooks/useStartBoardCardDrag';
import { RecordBoardDeactivateBoardCardEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardDeactivateBoardCardEffect';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewType } from '@/views/types/ViewType';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 100%;
  position: relative;
`;

const StyledColumnContainer = styled.div`
  display: flex;

  & > *:not(:first-of-type) {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100% - ${({ theme }) => theme.spacing(2)});
  height: min-content;
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const RecordBoard = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const { toggleClickOutside } = useClickOutsideListener(
    RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { deactivateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const handleDragSelectionStart = () => {
    closeAnyOpenDropdown();
    toggleClickOutside(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutside(true);
  };

  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const { resetRecordSelection, setRecordAsSelected } =
    useRecordBoardSelection(recordBoardId);

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const recordBoardSelectedRecordIdsSelector = useRecoilComponentCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const startDrag = useStartBoardCardDrag(recordBoardId);
  const endDrag = useEndBoardCardDrag(recordBoardId);
  const multiDragState = useBoardCardDragState(recordBoardId);

  const { processDragOperation } = useRecordBoardDragOperations();

  useListenClickOutside({
    excludedClickOutsideIds: [
      ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      COMMAND_MENU_CLICK_OUTSIDE_ID,
      MODAL_BACKDROP_CLICK_OUTSIDE_ID,
      PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID,
      RECORD_BOARD_CARD_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
    ],
    listenerId: RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
    refs: [],
    callback: () => {
      if (!multiDragState.isDragging) {
        resetRecordSelection();
        deactivateBoardCard();
        unfocusBoardCard();
      }
    },
  });

  const { openModal } = useModal();

  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      (start: DragStart) => {
        const currentSelectedRecordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );

        startDrag(start, currentSelectedRecordIds);
      },
    [recordBoardSelectedRecordIdsSelector, startDrag],
  );

  const handleDragEnd: OnDragEndResponder = useRecoilCallback(
    () => (result) => {
      endDrag();

      if (!result.destination) return;

      if (currentRecordSorts.length > 0) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      processDragOperation(result, multiDragState.originalSelection);
    },
    [
      processDragOperation,
      multiDragState.originalSelection,
      endDrag,
      currentRecordSorts,
      openModal,
    ],
  );

  // FixMe: Check if we really need this as it depends on the times it takes to update the view groups
  // if (isPersistingViewGroups) {
  //   // TODO: Add skeleton state
  //   return null;
  // }

  return (
    <RecordBoardComponentInstanceContext.Provider
      value={{ instanceId: recordBoardId }}
    >
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardStickyHeaderEffect />
        <RecordBoardScrollToFocusedCardEffect />
        <RecordBoardDeactivateBoardCardEffect />
        <StyledContainerContainer>
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <DragDropContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <StyledColumnContainer>
                  {visibleRecordGroupIds.map((recordGroupId, index) => (
                    <RecordBoardColumn
                      key={recordGroupId}
                      recordBoardColumnId={recordGroupId}
                      recordBoardColumnIndex={index}
                    />
                  ))}
                </StyledColumnContainer>
              </DragDropContext>

              <DragSelect
                selectableItemsContainerRef={boardRef}
                onDragSelectionEnd={handleDragSelectionEnd}
                onDragSelectionChange={setRecordAsSelected}
                onDragSelectionStart={handleDragSelectionStart}
                scrollWrapperComponentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
                selectionBoundaryClass={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
              />
            </StyledContainer>
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
    </RecordBoardComponentInstanceContext.Provider>
  );
};
