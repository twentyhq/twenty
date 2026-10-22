import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

const resolveNearestScrollIntoViewDelta = ({
  elementStart,
  elementEnd,
  scrollportStart,
  scrollportEnd,
}: {
  elementStart: number;
  elementEnd: number;
  scrollportStart: number;
  scrollportEnd: number;
}): number => {
  const isStartOutside = elementStart < scrollportStart;
  const isEndOutside = elementEnd > scrollportEnd;

  if (isStartOutside === isEndOutside) {
    return 0;
  }

  const isElementLargerThanScrollport =
    elementEnd - elementStart > scrollportEnd - scrollportStart;
  const shouldAlignStart = isStartOutside !== isElementLargerThanScrollport;

  return shouldAlignStart
    ? elementStart - scrollportStart
    : elementEnd - scrollportEnd;
};

export const resolveScrollIntoViewDelta = ({
  elementStart,
  elementEnd,
  scrollportStart,
  scrollportEnd,
  alignment,
}: {
  elementStart: number;
  elementEnd: number;
  scrollportStart: number;
  scrollportEnd: number;
  alignment: ScrollIntoViewAlignment;
}): number => {
  if (alignment === 'start') {
    return elementStart - scrollportStart;
  }

  if (alignment === 'end') {
    return elementEnd - scrollportEnd;
  }

  if (alignment === 'center') {
    return (
      (elementStart + elementEnd) / 2 - (scrollportStart + scrollportEnd) / 2
    );
  }

  return resolveNearestScrollIntoViewDelta({
    elementStart,
    elementEnd,
    scrollportStart,
    scrollportEnd,
  });
};
