import { styled } from '@linaria/react';
import { Fragment, useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardCardContextProvider } from '@/object-record/record-board/record-board-card/components/RecordBoardCardContextProvider';
import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { getEstimatedRecordBoardCardHeight } from '@/object-record/record-board/utils/getEstimatedRecordBoardCardHeight';
import { RecordBoardColumnCardWindowEffect } from '@/object-record/record-board/virtualization/components/RecordBoardColumnCardWindowEffect';
import { RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationMinimumCardCount';
import { recordBoardColumnCardWindowComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardWindowComponentFamilyState';
import { getRecordBoardCardWindowSegments } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardWindowSegments';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

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

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const numberOfCards = recordIndexRecordIdsByGroup.length;

  const isCardWindowingActive =
    numberOfCards >= RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT;

  const cardSlotHeight =
    recordBoardColumnCardWindow?.cardSlotHeight ??
    getEstimatedRecordBoardCardHeight(visibleRecordFields.length);

  const cardWindowSegments = getRecordBoardCardWindowSegments({
    numberOfCards,
    firstCardIndexInWindow: isCardWindowingActive
      ? (recordBoardColumnCardWindow?.firstCardIndexInWindow ?? 0)
      : 0,
    lastCardIndexInWindow: isCardWindowingActive
      ? (recordBoardColumnCardWindow?.lastCardIndexInWindow ??
        RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT - 1)
      : numberOfCards - 1,
  });

  return (
    <StyledColumnCardsContainer
      ref={cardsContainerRef}
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
                  (cardWindowSegment.lastCardIndex -
                    cardWindowSegment.firstCardIndex +
                    1) *
                  cardSlotHeight
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
