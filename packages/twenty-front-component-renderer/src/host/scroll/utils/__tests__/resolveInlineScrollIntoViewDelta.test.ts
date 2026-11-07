import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveInlineScrollIntoViewDelta } from '@/host/scroll/utils/resolveInlineScrollIntoViewDelta';
import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

const SCROLLPORT: ScrollBox = { top: 0, right: 200, bottom: 100, left: 100 };

const createTargetBox = ({
  left,
  right,
}: {
  left: number;
  right: number;
}): ScrollBox => ({ top: 10, right, bottom: 20, left });

const resolveDeltaInScrollport = ({
  left,
  right,
  alignment,
  isRightToLeft,
}: {
  left: number;
  right: number;
  alignment: ScrollIntoViewAlignment;
  isRightToLeft: boolean;
}) =>
  resolveInlineScrollIntoViewDelta({
    targetBox: createTargetBox({ left, right }),
    scrollport: SCROLLPORT,
    alignment,
    isRightToLeft,
  });

describe('resolveInlineScrollIntoViewDelta', () => {
  it.each(SCROLL_INTO_VIEW_ALIGNMENTS)(
    'should map left to start and right to end for %s alignment in left to right layouts',
    (alignment) => {
      const targetBox = createTargetBox({ left: 180, right: 220 });

      expect(
        resolveInlineScrollIntoViewDelta({
          targetBox,
          scrollport: SCROLLPORT,
          alignment,
          isRightToLeft: false,
        }),
      ).toBe(
        resolveScrollIntoViewDelta({
          elementStart: targetBox.left,
          elementEnd: targetBox.right,
          scrollportStart: SCROLLPORT.left,
          scrollportEnd: SCROLLPORT.right,
          alignment,
        }),
      );
    },
  );

  describe('right to left', () => {
    it('should align the right edges for start alignment', () => {
      expect(
        resolveDeltaInScrollport({
          left: 150,
          right: 170,
          alignment: 'start',
          isRightToLeft: true,
        }),
      ).toBe(-30);
    });

    it('should align the left edges for end alignment', () => {
      expect(
        resolveDeltaInScrollport({
          left: 150,
          right: 170,
          alignment: 'end',
          isRightToLeft: true,
        }),
      ).toBe(50);
    });

    it('should increase the scroll offset for start alignment when the target is past the right edge', () => {
      expect(
        resolveDeltaInScrollport({
          left: 220,
          right: 240,
          alignment: 'start',
          isRightToLeft: true,
        }),
      ).toBe(40);
    });

    it('should decrease the scroll offset for end alignment when the target is past the left edge', () => {
      expect(
        resolveDeltaInScrollport({
          left: 40,
          right: 60,
          alignment: 'end',
          isRightToLeft: true,
        }),
      ).toBe(-60);
    });

    it('should align the centers for center alignment', () => {
      expect(
        resolveDeltaInScrollport({
          left: 150,
          right: 170,
          alignment: 'center',
          isRightToLeft: true,
        }),
      ).toBe(10);
    });

    it('should not scroll for nearest alignment when the target is fully visible', () => {
      expect(
        resolveDeltaInScrollport({
          left: 150,
          right: 170,
          alignment: 'nearest',
          isRightToLeft: true,
        }),
      ).toBeCloseTo(0);
    });

    it('should not scroll for nearest alignment when the target straddles both edges', () => {
      expect(
        resolveDeltaInScrollport({
          left: 50,
          right: 250,
          alignment: 'nearest',
          isRightToLeft: true,
        }),
      ).toBeCloseTo(0);
    });

    it('should scroll left for nearest alignment when the target overflows the left edge', () => {
      expect(
        resolveDeltaInScrollport({
          left: 40,
          right: 60,
          alignment: 'nearest',
          isRightToLeft: true,
        }),
      ).toBe(-60);
    });

    it('should scroll right for nearest alignment when the target overflows the right edge', () => {
      expect(
        resolveDeltaInScrollport({
          left: 180,
          right: 220,
          alignment: 'nearest',
          isRightToLeft: true,
        }),
      ).toBe(20);
    });

    it('should resolve the same physical nearest delta as left to right layouts', () => {
      const targetHorizontalExtents = [
        { left: 80, right: 120 },
        { left: 180, right: 220 },
        { left: 0, right: 150 },
        { left: 150, right: 300 },
        { left: 50, right: 150 },
        { left: 150, right: 250 },
      ];

      for (const { left, right } of targetHorizontalExtents) {
        expect(
          resolveDeltaInScrollport({
            left,
            right,
            alignment: 'nearest',
            isRightToLeft: true,
          }),
        ).toBe(
          resolveDeltaInScrollport({
            left,
            right,
            alignment: 'nearest',
            isRightToLeft: false,
          }),
        );
      }
    });
  });
});
