import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { MultiDragStateContext } from '@/object-record/record-board/contexts/MultiDragStateContext';
import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilValue } from 'recoil';

const StyledColumn = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;
  min-height: 100%;
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: 0px;
  position: relative;
  height: 100%;
`;

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
  recordBoardColumnIndex: number;
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
  recordBoardColumnIndex,
}: RecordBoardColumnProps) => {
  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(recordBoardColumnId),
  );

  const recordIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const multiDragState = useContext(MultiDragStateContext);

  const filteredRecordIds = recordIdsByGroup.filter((recordId) => {
    if (
      !multiDragState?.isDragging ||
      multiDragState.originalSelection.length <= 1
    ) {
      return true;
    }

    const isPartOfMultiDrag =
      multiDragState.originalSelection.includes(recordId);
    const isPrimaryDraggedRecord =
      recordId === multiDragState.primaryDraggedRecordId;

    return !isPartOfMultiDrag || isPrimaryDraggedRecord;
  });

  if (!recordGroupDefinition) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: recordGroupDefinition,
        columnId: recordBoardColumnId,
        recordIds: filteredRecordIds,
        columnIndex: recordBoardColumnIndex,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn>
            <RecordBoardColumnCardsContainer
              droppableProvided={droppableProvided}
              recordIds={filteredRecordIds}
            />
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
