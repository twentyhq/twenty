import styled from '@emotion/styled';
import { Draggable, type DroppableProvided } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { RecordBoardColumnFetchMoreLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnFetchMoreLoader';
import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { getNumberOfCardsPerColumnForSkeletonLoading } from '@/object-record/record-board/record-board-column/utils/getNumberOfCardsPerColumnForSkeletonLoading';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledNewButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;
// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledSkeletonCardContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow:
    0px 4px 8px 0px rgba(0, 0, 0, 0.08),
    0px 0px 4px 0px rgba(0, 0, 0, 0.08);
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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

  const columnId = columnDefinition.id;

  const recordIds = useRecoilComponentFamilyValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const isRecordIndexBoardColumnLoading = useRecoilValue(
    isRecordIndexBoardColumnLoadingFamilyState(columnId),
  );

  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      {isRecordIndexBoardColumnLoading
        ? Array.from(
            {
              length: getNumberOfCardsPerColumnForSkeletonLoading(
                columnDefinition.position,
              ),
            },
            (_, index) => (
              <StyledSkeletonCardContainer
                key={`${columnDefinition.id}-${index}`}
              >
                <RecordBoardColumnCardContainerSkeletonLoader />
              </StyledSkeletonCardContainer>
            ),
          )
        : recordIds.map((recordId, index) => (
            <RecordBoardCardDraggableContainer
              key={recordId}
              recordId={recordId}
              rowIndex={index}
            />
          ))}
      <RecordBoardColumnFetchMoreLoader />
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
