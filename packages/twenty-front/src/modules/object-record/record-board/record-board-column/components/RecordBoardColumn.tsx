import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { DragAndDropLibraryLegacyReRenderBreaker } from '@/ui/drag-and-drop/components/DragAndDropReRenderBreaker';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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
  const recordIdsByGroup = useRecoilComponentFamilyValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const shouldHideEmptyRecordGroups = useRecoilComponentValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const isRecordGroupEmpty = useRecoilComponentFamilyValue(
    emptyRecordGroupByIdComponentFamilyState,
    recordBoardColumnId,
  );

  if (shouldHideEmptyRecordGroups && isRecordGroupEmpty) {
    return null;
  }

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: recordGroupDefinition,
        columnId: recordBoardColumnId,
        recordIds: recordIdsByGroup,
        columnIndex: recordBoardColumnIndex,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn>
            <DragAndDropLibraryLegacyReRenderBreaker
              memoizationId={recordBoardColumnId}
            >
              <RecordBoardColumnCardsContainer
                droppableProvided={droppableProvided}
                recordBoardColumnId={recordBoardColumnId}
              />
            </DragAndDropLibraryLegacyReRenderBreaker>
            {droppableProvided.placeholder}
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
