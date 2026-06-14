import { Draggable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';

import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledColumnCardsContainer = styled.div<{ isDropProcessing: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  pointer-events: ${({ isDropProcessing }) =>
    isDropProcessing ? 'none' : 'auto'};
`;

const StyledNewButtonContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[4]};
`;

type RecordBoardColumnCardsContainerProps = {
  recordBoardColumnId: string;
};

export const RecordBoardColumnCardsContainer = ({
  recordBoardColumnId,
}: RecordBoardColumnCardsContainerProps) => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const recordBoardShouldFetchMoreInColumn = useAtomComponentFamilyStateValue(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    recordBoardColumnId,
  );

  const isRecordBoardDropProcessing = useAtomComponentStateValue(
    isRecordBoardDropProcessingComponentState,
  );

  return (
    <StyledColumnCardsContainer
      isDropProcessing={isRecordBoardDropProcessing}
      data-replay-ignore-mutations="true"
    >
      {recordIndexRecordIdsByGroup.map((recordId, index) => (
        <RecordBoardCardDraggableContainer
          key={recordId}
          recordId={recordId}
          rowIndex={index}
        />
      ))}
      {recordBoardShouldFetchMoreInColumn ? (
        <RecordBoardColumnLoadingSkeletonCards />
      ) : null}
      <Draggable
        draggableId={`new-${columnDefinition.id}-bottom`}
        index={recordIndexRecordIdsByGroup.length}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
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
