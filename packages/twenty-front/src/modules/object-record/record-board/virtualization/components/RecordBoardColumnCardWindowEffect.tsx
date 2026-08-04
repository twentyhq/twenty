import { type RefObject, useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getEstimatedRecordBoardCardHeight } from '@/object-record/record-board/utils/getEstimatedRecordBoardCardHeight';
import { RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationMinimumCardCount';
import { RECORD_BOARD_VIRTUALIZATION_OVERSCAN_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationOverscanCardCount';
import { recordBoardColumnCardWindowComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardWindowComponentFamilyState';
import { getRecordBoardVisibleCardRange } from '@/object-record/record-board/virtualization/utils/getRecordBoardVisibleCardRange';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

type RecordBoardColumnCardWindowEffectProps = {
  recordBoardColumnId: string;
  cardsContainerRef: RefObject<HTMLDivElement | null>;
};

export const RecordBoardColumnCardWindowEffect = ({
  recordBoardColumnId,
  cardsContainerRef,
}: RecordBoardColumnCardWindowEffectProps) => {
  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const numberOfCards = recordIndexRecordIdsByGroup.length;

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const numberOfVisibleRecordFields = visibleRecordFields.length;

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const setRecordBoardColumnCardWindow = useSetAtomComponentFamilyState(
    recordBoardColumnCardWindowComponentFamilyState,
    recordBoardColumnId,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const recomputeCardWindow = useCallback(() => {
    const cardsContainerElement = cardsContainerRef.current;

    if (
      !isDefined(cardsContainerElement) ||
      !isDefined(scrollWrapperHTMLElement)
    ) {
      return;
    }

    if (numberOfCards < RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT) {
      setRecordBoardColumnCardWindow(null);
      return;
    }

    // Cards are uniform in height within a view, so one rendered card gives
    // the slot height for every placeholder.
    const firstRenderedCardElement = cardsContainerElement.querySelector(
      '[data-selectable-id]',
    );

    const cardSlotHeight =
      firstRenderedCardElement instanceof HTMLElement &&
      firstRenderedCardElement.offsetHeight > 0
        ? firstRenderedCardElement.offsetHeight
        : getEstimatedRecordBoardCardHeight(
            isCompactModeActive ? 0 : numberOfVisibleRecordFields,
          );

    const scrollTop = scrollWrapperHTMLElement.scrollTop;

    const cardsContainerOffsetTop =
      cardsContainerElement.getBoundingClientRect().top -
      scrollWrapperHTMLElement.getBoundingClientRect().top +
      scrollTop;

    const { firstCardIndexInWindow, lastCardIndexInWindow } =
      getRecordBoardVisibleCardRange({
        scrollTop,
        viewportHeight: scrollWrapperHTMLElement.clientHeight,
        cardsContainerOffsetTop,
        cardSlotHeight,
        numberOfCards,
        overscanCardCount: RECORD_BOARD_VIRTUALIZATION_OVERSCAN_CARD_COUNT,
      });

    setRecordBoardColumnCardWindow((currentCardWindow) => {
      if (
        isDefined(currentCardWindow) &&
        currentCardWindow.firstCardIndexInWindow === firstCardIndexInWindow &&
        currentCardWindow.lastCardIndexInWindow === lastCardIndexInWindow &&
        currentCardWindow.cardSlotHeight === cardSlotHeight
      ) {
        return currentCardWindow;
      }

      return {
        firstCardIndexInWindow,
        lastCardIndexInWindow,
        cardSlotHeight,
      };
    });
  }, [
    cardsContainerRef,
    scrollWrapperHTMLElement,
    numberOfCards,
    numberOfVisibleRecordFields,
    isCompactModeActive,
    setRecordBoardColumnCardWindow,
  ]);

  useEffect(() => {
    recomputeCardWindow();

    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    scrollWrapperHTMLElement.addEventListener('scroll', recomputeCardWindow, {
      passive: true,
    });
    window.addEventListener('resize', recomputeCardWindow);

    return () => {
      scrollWrapperHTMLElement.removeEventListener(
        'scroll',
        recomputeCardWindow,
      );
      window.removeEventListener('resize', recomputeCardWindow);
    };
  }, [recomputeCardWindow, scrollWrapperHTMLElement]);

  return null;
};
