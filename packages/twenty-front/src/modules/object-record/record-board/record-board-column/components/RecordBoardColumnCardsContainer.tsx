import { Draggable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { SENTRY_REPLAY_IGNORE_MUTATIONS_PROPS } from '@/error-handler/constants/SentryReplayIgnoreMutationsProps';
import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';

import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
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

  return (
    <StyledColumnCardsContainer
      // Cards are not virtualized: card batches on fetch-more / drag-and-drop
      // / view switch are expensive for rrweb
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...SENTRY_REPLAY_IGNORE_MUTATIONS_PROPS}
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
