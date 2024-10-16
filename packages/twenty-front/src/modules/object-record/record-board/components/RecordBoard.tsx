import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useContext, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/get-dragged-record-position.util';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollRestoration } from '~/hooks/useScrollRestoration';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: calc(100% - 1px);
  height: 100%;
`;

const StyledColumnContainer = styled.div`
  display: flex;
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecordBoardScrollRestoreEffect = () => {
  useScrollRestoration();
  return null;
};

export const RecordBoard = () => {
  const { updateOneRecord, selectFieldMetadataItem, recordBoardId } =
    useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const {
    columnIdsState,
    columnsFamilySelector,
    recordIdsByColumnIdFamilyState,
  } = useRecordBoardStates(recordBoardId);

  const columnIds = useRecoilValue(columnIdsState);

  const { resetRecordSelection, setRecordAsSelected } =
    useRecordBoardSelection(recordBoardId);

  useListenClickOutsideByClassName({
    classNames: ['record-board-card'],
    excludeClassNames: ['bottom-bar', 'context-menu'],
    callback: resetRecordSelection,
  });

  useScopedHotkeys([Key.Escape], resetRecordSelection, TableHotkeyScope.Table);

  const handleDragEnd: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) return;

        const draggedRecordId = result.draggableId;
        const sourceColumnId = result.source.droppableId;
        const destinationColumnId = result.destination.droppableId;
        const destinationIndexInColumn = result.destination.index;

        if (!destinationColumnId || !selectFieldMetadataItem) return;

        const column = snapshot
          .getLoadable(columnsFamilySelector(destinationColumnId))
          .getValue();

        if (!column) return;

        const destinationColumnRecordIds = snapshot
          .getLoadable(recordIdsByColumnIdFamilyState(destinationColumnId))
          .getValue();
        const otherRecordsInDestinationColumn =
          sourceColumnId === destinationColumnId
            ? destinationColumnRecordIds.filter(
                (recordId) => recordId !== draggedRecordId,
              )
            : destinationColumnRecordIds;

        const recordBeforeId =
          otherRecordsInDestinationColumn[destinationIndexInColumn - 1];
        const recordBefore = recordBeforeId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeId))
              .getValue()
          : null;

        const recordAfterId =
          otherRecordsInDestinationColumn[destinationIndexInColumn];
        const recordAfter = recordAfterId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterId))
              .getValue()
          : null;

        const draggedRecordPosition = getDraggedRecordPosition(
          recordBefore?.position,
          recordAfter?.position,
        );

        updateOneRecord({
          idToUpdate: draggedRecordId,
          updateOneRecordInput: {
            [selectFieldMetadataItem.name]: column.value,
            position: draggedRecordPosition,
          },
        });
      },
    [
      columnsFamilySelector,
      recordIdsByColumnIdFamilyState,
      selectFieldMetadataItem,
      updateOneRecord,
    ],
  );

  return (
    <RecordBoardScope
      recordBoardScopeId={getScopeIdFromComponentId(recordBoardId)}
      onColumnsChange={() => {}}
      onFieldsChange={() => {}}
    >
      <ScrollWrapper contextProviderName="recordBoard">
        <RecordBoardStickyHeaderEffect />
        <StyledContainerContainer>
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <StyledColumnContainer>
                  {columnIds.map((columnId) => (
                    <RecordBoardColumn
                      key={columnId}
                      recordBoardColumnId={columnId}
                    />
                  ))}
                </StyledColumnContainer>
              </DragDropContext>
            </StyledContainer>
            <RecordBoardScrollRestoreEffect />
            <DragSelect
              dragSelectable={boardRef}
              onDragSelectionStart={resetRecordSelection}
              onDragSelectionChange={setRecordAsSelected}
            />
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
    </RecordBoardScope>
  );
};
