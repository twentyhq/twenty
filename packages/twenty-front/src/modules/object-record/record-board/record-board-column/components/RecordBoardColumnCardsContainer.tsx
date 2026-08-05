import { styled } from '@linaria/react';
import { Fragment, useContext, useMemo, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardCardContextProvider } from '@/object-record/record-board/record-board-card/components/RecordBoardCardContextProvider';
import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useEstimatedRecordBoardCardHeight } from '@/object-record/record-board/hooks/useEstimatedRecordBoardCardHeight';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { RecordBoardColumnCardWindowEffect } from '@/object-record/record-board/virtualization/components/RecordBoardColumnCardWindowEffect';
import { RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationMinimumCardCount';
import { recordBoardColumnCardHeightByRecordIdComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardHeightByRecordIdComponentFamilyState';
import { recordBoardColumnCardWindowComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardWindowComponentFamilyState';
import { getRecordBoardCardOffsets } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardOffsets';
import { getRecordBoardCardWindowSegments } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardWindowSegments';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledCardWindowPlaceholder = styled.div<{ height: number }>`
  flex-shrink: 0;
  height: ${({ height }) => height}px;
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
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const { columnIndex } = useContext(RecordBoardColumnContext);

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const recordBoardShouldFetchMoreInColumn = useAtomComponentFamilyStateValue(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    recordBoardColumnId,
  );

  const recordBoardColumnCardWindow = useAtomComponentFamilyStateValue(
    recordBoardColumnCardWindowComponentFamilyState,
    recordBoardColumnId,
  );

  const draggedRecordIds = useAtomComponentStateValue(
    draggedRecordIdsComponentState,
  );

  const focusedRecordBoardCardIndexes = useAtomComponentStateValue(
    focusedRecordBoardCardIndexesComponentState,
  );

  const recordBoardColumnCardHeightByRecordId =
    useAtomComponentFamilyStateValue(
      recordBoardColumnCardHeightByRecordIdComponentFamilyState,
      recordBoardColumnId,
    );

  const estimatedCardHeight = useEstimatedRecordBoardCardHeight();

  const cardOffsets = useMemo(
    () =>
      getRecordBoardCardOffsets({
        recordIds: recordIndexRecordIdsByGroup,
        cardHeightByRecordId: recordBoardColumnCardHeightByRecordId,
        estimatedCardHeight,
      }),
    [
      recordIndexRecordIdsByGroup,
      recordBoardColumnCardHeightByRecordId,
      estimatedCardHeight,
    ],
  );

  const numberOfCards = recordIndexRecordIdsByGroup.length;

  const isCardWindowingActive =
    numberOfCards >= RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT;

  // Dragged cards must stay mounted so dnd-kit keeps its drag source, and the
  // focused card so keyboard navigation can scroll to it.
  const forcedCardIndexes = draggedRecordIds
    .map((draggedRecordId) =>
      recordIndexRecordIdsByGroup.indexOf(draggedRecordId),
    )
    .filter((draggedCardIndex) => draggedCardIndex !== -1);

  if (
    isDefined(focusedRecordBoardCardIndexes) &&
    focusedRecordBoardCardIndexes.columnIndex === columnIndex
  ) {
    forcedCardIndexes.push(focusedRecordBoardCardIndexes.rowIndex);
  }

  const cardWindowSegments = getRecordBoardCardWindowSegments({
    numberOfCards,
    firstCardIndexInWindow: isCardWindowingActive
      ? (recordBoardColumnCardWindow?.firstCardIndexInWindow ?? 0)
      : 0,
    lastCardIndexInWindow: isCardWindowingActive
      ? (recordBoardColumnCardWindow?.lastCardIndexInWindow ??
        RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT - 1)
      : numberOfCards - 1,
    forcedCardIndexes,
  });

  return (
    <StyledColumnCardsContainer
      ref={cardsContainerRef}
      data-record-board-column-cards-id={recordBoardColumnId}
      data-replay-ignore-mutations="true"
    >
      <RecordBoardColumnCardWindowEffect
        recordBoardColumnId={recordBoardColumnId}
        cardsContainerRef={cardsContainerRef}
      />
      {cardWindowSegments.flatMap((cardWindowSegment) =>
        cardWindowSegment.type === 'placeholder'
          ? [
              <StyledCardWindowPlaceholder
                key={`card-window-placeholder-${cardWindowSegment.firstCardIndex}`}
                height={
                  cardOffsets[cardWindowSegment.lastCardIndex + 1] -
                  cardOffsets[cardWindowSegment.firstCardIndex]
                }
              />,
            ]
          : recordIndexRecordIdsByGroup
              .slice(
                cardWindowSegment.firstCardIndex,
                cardWindowSegment.lastCardIndex + 1,
              )
              .map((recordId, indexInSegment) => {
                const cardIndex =
                  cardWindowSegment.firstCardIndex + indexInSegment;

                return (
                  <Fragment key={recordId}>
                    <DragDropItemDropTarget
                      index={cardIndex}
                      droppableId={recordBoardColumnId}
                      orientation="horizontal"
                      compact
                    />
                    <RecordBoardCardContextProvider
                      recordId={recordId}
                      rowIndex={cardIndex}
                      group={recordBoardColumnId}
                    />
                  </Fragment>
                );
              }),
      )}
      {recordBoardShouldFetchMoreInColumn ? (
        <RecordBoardColumnLoadingSkeletonCards />
      ) : null}
      <DragDropItemDropTarget
        index={numberOfCards}
        droppableId={recordBoardColumnId}
        orientation="horizontal"
        compact
      />
      <StyledNewButtonContainer>
        <RecordBoardColumnNewRecordButton />
      </StyledNewButtonContainer>
    </StyledColumnCardsContainer>
  );
};
