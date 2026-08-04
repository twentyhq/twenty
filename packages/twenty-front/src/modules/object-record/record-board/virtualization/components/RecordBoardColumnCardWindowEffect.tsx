import { useStore } from 'jotai';
import { type RefObject, useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useEstimatedRecordBoardCardHeight } from '@/object-record/record-board/hooks/useEstimatedRecordBoardCardHeight';
import { RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationMinimumCardCount';
import { RECORD_BOARD_VIRTUALIZATION_OVERSCAN_CARD_COUNT } from '@/object-record/record-board/virtualization/constants/RecordBoardVirtualizationOverscanCardCount';
import { recordBoardColumnCardHeightByRecordIdComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardHeightByRecordIdComponentFamilyState';
import { recordBoardColumnCardWindowComponentFamilyState } from '@/object-record/record-board/virtualization/states/recordBoardColumnCardWindowComponentFamilyState';
import { getRecordBoardCardOffsets } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardOffsets';
import { getRecordBoardVisibleCardRange } from '@/object-record/record-board/virtualization/utils/getRecordBoardVisibleCardRange';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';

type RecordBoardColumnCardWindowEffectProps = {
  recordBoardColumnId: string;
  cardsContainerRef: RefObject<HTMLDivElement | null>;
};

export const RecordBoardColumnCardWindowEffect = ({
  recordBoardColumnId,
  cardsContainerRef,
}: RecordBoardColumnCardWindowEffectProps) => {
  const store = useStore();

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const estimatedCardHeight = useEstimatedRecordBoardCardHeight();

  const setRecordBoardColumnCardWindow = useSetAtomComponentFamilyState(
    recordBoardColumnCardWindowComponentFamilyState,
    recordBoardColumnId,
  );

  const cardHeightByRecordIdCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordBoardColumnCardHeightByRecordIdComponentFamilyState,
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

    const numberOfCards = recordIndexRecordIdsByGroup.length;

    if (numberOfCards < RECORD_BOARD_VIRTUALIZATION_MINIMUM_CARD_COUNT) {
      setRecordBoardColumnCardWindow(null);
      return;
    }

    const cardHeightByRecordId = store.get(
      cardHeightByRecordIdCallbackState(recordBoardColumnId),
    );

    const cardOffsets = getRecordBoardCardOffsets({
      recordIds: recordIndexRecordIdsByGroup,
      cardHeightByRecordId,
      estimatedCardHeight,
    });

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
        cardOffsets,
        overscanCardCount: RECORD_BOARD_VIRTUALIZATION_OVERSCAN_CARD_COUNT,
      });

    setRecordBoardColumnCardWindow((currentCardWindow) => {
      if (
        isDefined(currentCardWindow) &&
        currentCardWindow.firstCardIndexInWindow === firstCardIndexInWindow &&
        currentCardWindow.lastCardIndexInWindow === lastCardIndexInWindow
      ) {
        return currentCardWindow;
      }

      return { firstCardIndexInWindow, lastCardIndexInWindow };
    });
  }, [
    cardsContainerRef,
    scrollWrapperHTMLElement,
    recordIndexRecordIdsByGroup,
    estimatedCardHeight,
    store,
    cardHeightByRecordIdCallbackState,
    recordBoardColumnId,
    setRecordBoardColumnCardWindow,
  ]);

  const handleCardElementResizes = useCallback(
    (resizeObserverEntries: ResizeObserverEntry[]) => {
      let hasAnyCardHeightChanged = false;

      store.set(
        cardHeightByRecordIdCallbackState(recordBoardColumnId),
        (currentCardHeightByRecordId) => {
          const nextCardHeightByRecordId = { ...currentCardHeightByRecordId };

          for (const resizeObserverEntry of resizeObserverEntries) {
            const cardElement = resizeObserverEntry.target;

            if (!(cardElement instanceof HTMLElement)) {
              continue;
            }

            const recordId = cardElement.dataset.selectableId;
            const cardHeight = cardElement.offsetHeight;

            if (
              isDefined(recordId) &&
              cardHeight > 0 &&
              nextCardHeightByRecordId[recordId] !== cardHeight
            ) {
              nextCardHeightByRecordId[recordId] = cardHeight;
              hasAnyCardHeightChanged = true;
            }
          }

          return hasAnyCardHeightChanged
            ? nextCardHeightByRecordId
            : currentCardHeightByRecordId;
        },
      );

      if (hasAnyCardHeightChanged) {
        recomputeCardWindow();
      }
    },
    [
      store,
      cardHeightByRecordIdCallbackState,
      recordBoardColumnId,
      recomputeCardWindow,
    ],
  );

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

  // The rendered card set changes as the window moves, so the mutation
  // observer re-targets the resize observer to catch per-card size changes
  // like compact mode expansion.
  useEffect(() => {
    const cardsContainerElement = cardsContainerRef.current;

    if (!isDefined(cardsContainerElement)) {
      return;
    }

    const resizeObserver = new ResizeObserver(handleCardElementResizes);

    const observeRenderedCardElements = () => {
      resizeObserver.disconnect();

      for (const cardElement of cardsContainerElement.querySelectorAll(
        '[data-selectable-id]',
      )) {
        resizeObserver.observe(cardElement);
      }
    };

    observeRenderedCardElements();

    const mutationObserver = new MutationObserver(observeRenderedCardElements);

    mutationObserver.observe(cardsContainerElement, { childList: true });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [handleCardElementResizes, cardsContainerRef]);

  return null;
};
