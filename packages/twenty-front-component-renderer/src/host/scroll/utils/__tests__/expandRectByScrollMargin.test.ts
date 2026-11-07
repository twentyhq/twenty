import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { expandRectByScrollMargin } from '@/host/scroll/utils/expandRectByScrollMargin';

type ScrollMarginStyle = Pick<
  CSSStyleDeclaration,
  | 'scrollMarginTop'
  | 'scrollMarginRight'
  | 'scrollMarginBottom'
  | 'scrollMarginLeft'
>;

const UNSCALED: ElementScale = { x: 1, y: 1 };

const TARGET_RECT = new DOMRect(20, 10, 30, 30);

const createUniformScrollMarginStyle = (
  scrollMargin: string,
): ScrollMarginStyle => ({
  scrollMarginTop: scrollMargin,
  scrollMarginRight: scrollMargin,
  scrollMarginBottom: scrollMargin,
  scrollMarginLeft: scrollMargin,
});

describe('expandRectByScrollMargin', () => {
  it('should keep the rect edges when the scroll margin is zero', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: createUniformScrollMarginStyle('0px'),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 10, right: 50, bottom: 40, left: 20 });
  });

  it('should expand each edge by its pixel scroll margin', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: {
          scrollMarginTop: '1px',
          scrollMarginRight: '2px',
          scrollMarginBottom: '3px',
          scrollMarginLeft: '4px',
        },
        scale: UNSCALED,
      }),
    ).toEqual({ top: 9, right: 52, bottom: 43, left: 16 });
  });

  it('should shrink each edge by a negative scroll margin', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: createUniformScrollMarginStyle('-2px'),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 12, right: 48, bottom: 38, left: 22 });
  });

  it('should scale the scroll margin on each axis', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: {
          scrollMarginTop: '1px',
          scrollMarginRight: '2px',
          scrollMarginBottom: '3px',
          scrollMarginLeft: '4px',
        },
        scale: { x: 2, y: 3 },
      }),
    ).toEqual({ top: 7, right: 54, bottom: 49, left: 12 });
  });

  it('should ignore percentage scroll margins', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: createUniformScrollMarginStyle('50%'),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 10, right: 50, bottom: 40, left: 20 });
  });

  it('should treat empty scroll margins as zero', () => {
    expect(
      expandRectByScrollMargin({
        rect: TARGET_RECT,
        style: createUniformScrollMarginStyle(''),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 10, right: 50, bottom: 40, left: 20 });
  });
});
