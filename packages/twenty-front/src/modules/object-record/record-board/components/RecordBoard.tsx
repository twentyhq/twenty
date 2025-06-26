import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
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
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardDeactivateBoardCardEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardDeactivateBoardCardEffect';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewType } from '@/views/types/ViewType';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';

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
  const { updateOneRecord, selectFieldMetadataItem, recordBoardId } =
    useContext(RecordBoardContext);
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

  const visibleRecordGroupIds = useRecoilComponentFamilyValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { resetRecordSelection, setRecordAsSelected } =
    useRecordBoardSelection(recordBoardId);

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

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
      resetRecordSelection();
      deactivateBoardCard();
      unfocusBoardCard();
    },
  });

  const { openModal } = useModal();

  const handleDragEnd: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) return;

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          return;
        }

        const draggedRecordId = result.draggableId;
        const sourceRecordGroupId = result.source.droppableId;
        const destinationRecordGroupId = result.destination.droppableId;
        const destinationIndexInColumn = result.destination.index;

        if (!destinationRecordGroupId || !selectFieldMetadataItem) return;

        const recordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(destinationRecordGroupId),
        );

        if (!recordGroup) return;

        const destinationRecordByGroupIds = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupFamilyState(destinationRecordGroupId),
        );
        const otherRecordIdsInDestinationColumn =
          sourceRecordGroupId === destinationRecordGroupId
            ? destinationRecordByGroupIds.filter(
                (recordId) => recordId !== draggedRecordId,
              )
            : destinationRecordByGroupIds;

        const { before: recordBeforeId, after: recordAfterId } =
          getIndexNeighboursElementsFromArray({
            index: destinationIndexInColumn,
            array: otherRecordIdsInDestinationColumn,
          });
        const recordBefore = recordBeforeId
          ? getSnapshotValue(snapshot, recordStoreFamilyState(recordBeforeId))
          : null;

        const recordAfter = recordAfterId
          ? getSnapshotValue(snapshot, recordStoreFamilyState(recordAfterId))
          : null;

        const draggedRecordPosition = getDraggedRecordPosition(
          recordBefore?.position,
          recordAfter?.position,
        );

        updateOneRecord({
          idToUpdate: draggedRecordId,
          updateOneRecordInput: {
            [selectFieldMetadataItem.name]: recordGroup.value,
            position: draggedRecordPosition,
          },
        });
      },
    [
      recordIndexRecordIdsByGroupFamilyState,
      selectFieldMetadataItem,
      updateOneRecord,
      openModal,
      currentRecordSorts,
    ],
  );

  // FixMe: Check if we really need this as it depends on the times it takes to update the view groups
  // if (isPersistingViewGroups) {
  //   // TODO: Add skeleton state
  //   return null;
  // }

  return (
    <RecordBoardScope
      recordBoardScopeId={recordBoardId}
      onColumnsChange={() => {}}
      onFieldsChange={() => {}}
    >
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
                <DragDropContext onDragEnd={handleDragEnd}>
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
                  selectionBoundaryClass={
                    RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS
                  }
                />
              </StyledContainer>
            </StyledBoardContentContainer>
          </StyledContainerContainer>
        </ScrollWrapper>
      </RecordBoardComponentInstanceContext.Provider>
    </RecordBoardScope>
  );
};
