import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export const isScrollIntoViewAlignment = (
  value: unknown,
): value is ScrollIntoViewAlignment =>
  SCROLL_INTO_VIEW_ALIGNMENTS.some((alignment) => alignment === value);
