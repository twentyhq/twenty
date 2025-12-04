import styled from '@emotion/styled';
import { Draggable, type DroppableProvided } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';

import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledNewButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

type RecordBoardColumnCardsContainerProps = {
  recordBoardColumnId: string;
  droppableProvided: DroppableProvided;
};

export const RecordBoardColumnCardsContainer = ({
  recordBoardColumnId,
  droppableProvided,
}: RecordBoardColumnCardsContainerProps) => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const recordIds = useRecoilComponentFamilyValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useRecoilComponentValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const recordBoardShouldFetchMoreInColumn = useRecoilComponentFamilyValue(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    recordBoardColumnId,
  );

  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      {recordIndexRecordGroupsAreInInitialLoading ? (
        <RecordBoardColumnLoadingSkeletonCards />
      ) : (
        recordIds.map((recordId, index) => (
          <RecordBoardCardDraggableContainer
            key={recordId}
            recordId={recordId}
            rowIndex={index}
          />
        ))
      )}
      {recordBoardShouldFetchMoreInColumn ? (
        <RecordBoardColumnLoadingSkeletonCards />
      ) : null}
      <Draggable
        draggableId={`new-${columnDefinition.id}-bottom`}
        index={recordIds.length}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
          ></div>
        )}
      </Draggable>
      <StyledNewButtonContainer>
        <RecordBoardColumnNewRecordButton />
      </StyledNewButtonContainer>
    </StyledColumnCardsContainer>
  );
};
