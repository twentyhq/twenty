import { isDefined } from 'twenty-shared/utils';

export type RecordBoardCardWindowSegment = {
  type: 'cards' | 'placeholder';
  firstCardIndex: number;
  lastCardIndex: number;
};

export const getRecordBoardCardWindowSegments = ({
  numberOfCards,
  firstCardIndexInWindow,
  lastCardIndexInWindow,
  forcedCardIndexes = [],
}: {
  numberOfCards: number;
  firstCardIndexInWindow: number;
  lastCardIndexInWindow: number;
  forcedCardIndexes?: number[];
}): RecordBoardCardWindowSegment[] => {
  if (numberOfCards <= 0) {
    return [];
  }

  const lastCardIndex = numberOfCards - 1;

  const windowStart = Math.min(
    Math.max(firstCardIndexInWindow, 0),
    lastCardIndex,
  );
  const windowEnd = Math.min(
    Math.max(lastCardIndexInWindow, windowStart),
    lastCardIndex,
  );

  const renderedCardIndexes = new Set<number>();

  for (let cardIndex = windowStart; cardIndex <= windowEnd; cardIndex++) {
    renderedCardIndexes.add(cardIndex);
  }

  for (const forcedCardIndex of forcedCardIndexes) {
    if (forcedCardIndex >= 0 && forcedCardIndex <= lastCardIndex) {
      renderedCardIndexes.add(forcedCardIndex);
    }
  }

  const sortedRenderedCardIndexes = [...renderedCardIndexes].sort(
    (firstIndex, secondIndex) => firstIndex - secondIndex,
  );

  const segments: RecordBoardCardWindowSegment[] = [];
  let nextCardIndex = 0;

  for (const renderedCardIndex of sortedRenderedCardIndexes) {
    if (renderedCardIndex > nextCardIndex) {
      segments.push({
        type: 'placeholder',
        firstCardIndex: nextCardIndex,
        lastCardIndex: renderedCardIndex - 1,
      });
    }

    const lastSegment = segments.at(-1);

    if (
      isDefined(lastSegment) &&
      lastSegment.type === 'cards' &&
      lastSegment.lastCardIndex === renderedCardIndex - 1
    ) {
      lastSegment.lastCardIndex = renderedCardIndex;
    } else {
      segments.push({
        type: 'cards',
        firstCardIndex: renderedCardIndex,
        lastCardIndex: renderedCardIndex,
      });
    }

    nextCardIndex = renderedCardIndex + 1;
  }

  if (nextCardIndex <= lastCardIndex) {
    segments.push({
      type: 'placeholder',
      firstCardIndex: nextCardIndex,
      lastCardIndex,
    });
  }

  return segments;
};
