import styled from '@emotion/styled';
import { Draggable, DroppableProvided } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { RecordBoardColumnCardsMemo } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsMemo';
import { RecordBoardColumnFetchMoreLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnFetchMoreLoader';
import { RecordBoardColumnNewButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewButton';
import { RecordBoardColumnNewOpportunityButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewOpportunityButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { getNumberOfCardsPerColumnForSkeletonLoading } from '@/object-record/record-board/record-board-column/utils/getNumberOfCardsPerColumnForSkeletonLoading';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledNewButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

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
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const columnId = columnDefinition.id;

  const isRecordIndexBoardColumnLoading = useRecoilValue(
    isRecordIndexBoardColumnLoadingFamilyState(columnId),
  );

  const { isCompactModeActiveState, visibleFieldDefinitionsState } =
    useRecordBoardStates();

  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
  );

  const numberOfFields = visibleFieldDefinitions.length;

  const isCompactModeActive = useRecoilValue(isCompactModeActiveState);
  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();

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
        draggableId={`new-${columnDefinition.id}`}
        index={recordIds.length}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
          >
            <StyledNewButtonContainer>
              {objectMetadataItem.nameSingular ===
                CoreObjectNameSingular.Opportunity &&
              !isOpportunitiesCompanyFieldDisabled ? (
                <RecordBoardColumnNewOpportunityButton
                  columnId={columnDefinition.id}
                />
              ) : (
                <RecordBoardColumnNewButton columnId={columnDefinition.id} />
              )}
            </StyledNewButtonContainer>
          </div>
        )}
      </Draggable>
      {droppableProvided?.placeholder}
    </StyledColumnCardsContainer>
  );
};
