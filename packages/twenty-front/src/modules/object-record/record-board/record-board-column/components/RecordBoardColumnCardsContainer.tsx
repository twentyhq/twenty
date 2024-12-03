import styled from '@emotion/styled';
import { Draggable, DroppableProvided } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { RecordBoardColumnCardsMemo } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsMemo';
import { RecordBoardColumnFetchMoreLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnFetchMoreLoader';
import { RecordBoardColumnNewOpportunity } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewOpportunity';
import { RecordBoardColumnNewRecord } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecord';
import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { getNumberOfCardsPerColumnForSkeletonLoading } from '@/object-record/record-board/record-board-column/utils/getNumberOfCardsPerColumnForSkeletonLoading';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

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

  const visibleFieldDefinitions = useRecoilComponentValueV2(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const numberOfFields = visibleFieldDefinitions.length;

  const isCompactModeActive = useRecoilComponentValueV2(
    isRecordBoardCompactModeActiveComponentState,
  );

  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();

  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      <Draggable
        draggableId={`new-${columnDefinition.id}-top`}
        index={-1}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
          >
            {objectMetadataItem.nameSingular ===
              CoreObjectNameSingular.Opportunity &&
            !isOpportunitiesCompanyFieldDisabled ? (
              <RecordBoardColumnNewOpportunity
                columnId={columnDefinition.id}
                position="first"
              />
            ) : (
              <RecordBoardColumnNewRecord
                columnId={columnDefinition.id}
                position="first"
              />
            )}
          </div>
        )}
      </Draggable>
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
          >
            {objectMetadataItem.nameSingular ===
              CoreObjectNameSingular.Opportunity &&
            !isOpportunitiesCompanyFieldDisabled ? (
              <RecordBoardColumnNewOpportunity
                columnId={columnDefinition.id}
                position="last"
              />
            ) : (
              <RecordBoardColumnNewRecord
                columnId={columnDefinition.id}
                position="last"
              />
            )}
            <StyledNewButtonContainer>
              <RecordBoardColumnNewRecordButton
                columnId={columnDefinition.id}
              />
            </StyledNewButtonContainer>
          </div>
        )}
      </Draggable>
      {droppableProvided?.placeholder}
    </StyledColumnCardsContainer>
  );
};
