import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export const resolveBlockScrollIntoViewDelta = ({
  targetBox,
  scrollport,
  alignment,
}: {
  targetBox: Pick<ScrollBox, 'top' | 'bottom'>;
  scrollport: Pick<ScrollBox, 'top' | 'bottom'>;
  alignment: ScrollIntoViewAlignment;
}): number =>
  resolveScrollIntoViewDelta({
    elementStart: targetBox.top,
    elementEnd: targetBox.bottom,
    scrollportStart: scrollport.top,
    scrollportEnd: scrollport.bottom,
    alignment,
  });
