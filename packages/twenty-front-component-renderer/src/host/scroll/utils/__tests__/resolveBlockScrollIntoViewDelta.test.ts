import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { resolveBlockScrollIntoViewDelta } from '@/host/scroll/utils/resolveBlockScrollIntoViewDelta';
import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';

const SCROLLPORT = { top: 100, bottom: 200 };
const TARGET_BOX = { top: 180, bottom: 220 };

describe('resolveBlockScrollIntoViewDelta', () => {
  it.each(SCROLL_INTO_VIEW_ALIGNMENTS)(
    'should map top to start and bottom to end for %s alignment',
    (alignment) => {
      expect(
        resolveBlockScrollIntoViewDelta({
          targetBox: TARGET_BOX,
          scrollport: SCROLLPORT,
          alignment,
        }),
      ).toBe(
        resolveScrollIntoViewDelta({
          elementStart: TARGET_BOX.top,
          elementEnd: TARGET_BOX.bottom,
          scrollportStart: SCROLLPORT.top,
          scrollportEnd: SCROLLPORT.bottom,
          alignment,
        }),
      );
    },
  );
});
