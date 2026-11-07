const SCROLLABLE_OVERFLOW_VALUES = new Set([
  'auto',
  'scroll',
  'hidden',
  'overlay',
]);

export const isScrollContainerOnAxis = ({
  overflow,
  scrollSize,
  clientSize,
}: {
  overflow: string;
  scrollSize: number;
  clientSize: number;
}): boolean =>
  SCROLLABLE_OVERFLOW_VALUES.has(overflow) && scrollSize > clientSize;
