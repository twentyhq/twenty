import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export const resolveInlineScrollIntoViewDelta = ({
  targetBox,
  scrollport,
  alignment,
  isRightToLeft,
}: {
  targetBox: Pick<ScrollBox, 'left' | 'right'>;
  scrollport: Pick<ScrollBox, 'left' | 'right'>;
  alignment: ScrollIntoViewAlignment;
  isRightToLeft: boolean;
}): number => {
  if (!isRightToLeft) {
    return resolveScrollIntoViewDelta({
      elementStart: targetBox.left,
      elementEnd: targetBox.right,
      scrollportStart: scrollport.left,
      scrollportEnd: scrollport.right,
      alignment,
    });
  }

  return -resolveScrollIntoViewDelta({
    elementStart: -targetBox.right,
    elementEnd: -targetBox.left,
    scrollportStart: -scrollport.right,
    scrollportEnd: -scrollport.left,
    alignment,
  });
};
