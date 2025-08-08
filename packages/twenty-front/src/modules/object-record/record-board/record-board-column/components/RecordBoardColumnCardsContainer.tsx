import styled from '@emotion/styled';
import { Draggable, DroppableProvided } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { RecordBoardColumnCardsMemo } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsMemo';
import { RecordBoardColumnFetchMoreLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnFetchMoreLoader';
import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { getNumberOfCardsPerColumnForSkeletonLoading } from '@/object-record/record-board/record-board-column/utils/getNumberOfCardsPerColumnForSkeletonLoading';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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
  recordIds: string[];
  droppableProvided: DroppableProvided;
};

export const RecordBoardColumnCardsContainer = ({
  recordIds,
  droppableProvided,
}: RecordBoardColumnCardsContainerProps) => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const columnId = columnDefinition.id;

  const isRecordIndexBoardColumnLoading = useRecoilValue(
    isRecordIndexBoardColumnLoadingFamilyState(columnId),
  );

  const visibleFieldDefinitions = useRecoilComponentValue(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const numberOfFields = visibleFieldDefinitions.length;

  const isCompactModeActive = useRecoilComponentValue(
    isRecordBoardCompactModeActiveComponentState,
  );

  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      {isRecordIndexBoardColumnLoading ? (
        Array.from(
          {
            length: getNumberOfCardsPerColumnForSkeletonLoading(
              columnDefinition.position,
            ),
          },
          (_, index) => (
            <StyledSkeletonCardContainer
              key={`${columnDefinition.id}-${index}`}
            >
              <RecordBoardColumnCardContainerSkeletonLoader
                numberOfFields={numberOfFields}
                titleSkeletonWidth={isCompactModeActive ? 72 : 54}
                isCompactModeActive={isCompactModeActive}
              />
            </StyledSkeletonCardContainer>
          ),
        )
      ) : (
        <RecordBoardColumnCardsMemo recordIds={recordIds} />
      )}
      <RecordBoardColumnFetchMoreLoader />
      <Draggable
        draggableId={`new-${columnDefinition.id}-bottom`}
        index={recordIds.length}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
          ></div>
        )}
      </Draggable>
      {droppableProvided?.placeholder}
      <StyledNewButtonContainer>
        <RecordBoardColumnNewRecordButton />
      </StyledNewButtonContainer>
    </StyledColumnCardsContainer>
  );
};
