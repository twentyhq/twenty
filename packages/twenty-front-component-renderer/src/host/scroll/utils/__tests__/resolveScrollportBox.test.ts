import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { resolveScrollportBox } from '@/host/scroll/utils/resolveScrollportBox';

type ScrollContainerGeometry = Pick<
  Element,
  | 'getBoundingClientRect'
  | 'clientLeft'
  | 'clientTop'
  | 'clientWidth'
  | 'clientHeight'
>;

type ScrollPaddingStyle = Pick<
  CSSStyleDeclaration,
  | 'scrollPaddingTop'
  | 'scrollPaddingRight'
  | 'scrollPaddingBottom'
  | 'scrollPaddingLeft'
>;

const UNSCALED: ElementScale = { x: 1, y: 1 };

const createUniformScrollPaddingStyle = (
  scrollPadding: string,
): ScrollPaddingStyle => ({
  scrollPaddingTop: scrollPadding,
  scrollPaddingRight: scrollPadding,
  scrollPaddingBottom: scrollPadding,
  scrollPaddingLeft: scrollPadding,
});

const SCROLL_CONTAINER: ScrollContainerGeometry = {
  getBoundingClientRect: () => new DOMRect(10, 20, 104, 56),
  clientLeft: 2,
  clientTop: 3,
  clientWidth: 100,
  clientHeight: 50,
};

describe('resolveScrollportBox', () => {
  it('should offset the scrollport by the client offsets and size it by the client size', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: createUniformScrollPaddingStyle('0px'),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 23, right: 112, bottom: 73, left: 12 });
  });

  it('should treat auto scroll padding as zero', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: createUniformScrollPaddingStyle('auto'),
        scale: UNSCALED,
      }),
    ).toEqual({ top: 23, right: 112, bottom: 73, left: 12 });
  });

  it('should shrink the scrollport by pixel scroll padding on each side', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: {
          scrollPaddingTop: '5px',
          scrollPaddingRight: '6px',
          scrollPaddingBottom: '7px',
          scrollPaddingLeft: '8px',
        },
        scale: UNSCALED,
      }),
    ).toEqual({ top: 28, right: 106, bottom: 66, left: 20 });
  });

  it('should resolve percentage scroll padding against the client size of each axis', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: {
          scrollPaddingTop: '10%',
          scrollPaddingRight: '20%',
          scrollPaddingBottom: '20%',
          scrollPaddingLeft: '10%',
        },
        scale: UNSCALED,
      }),
    ).toEqual({ top: 28, right: 92, bottom: 63, left: 22 });
  });

  it('should scale the client offsets and the client size', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: createUniformScrollPaddingStyle('0px'),
        scale: { x: 2, y: 0.5 },
      }),
    ).toEqual({ top: 21.5, right: 214, bottom: 46.5, left: 14 });
  });

  it('should scale pixel scroll padding', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: createUniformScrollPaddingStyle('4px'),
        scale: { x: 2, y: 0.5 },
      }),
    ).toEqual({ top: 23.5, right: 206, bottom: 44.5, left: 22 });
  });

  it('should scale percentage scroll padding resolved against the unscaled client size', () => {
    expect(
      resolveScrollportBox({
        scrollContainer: SCROLL_CONTAINER,
        scrollContainerStyle: createUniformScrollPaddingStyle('10%'),
        scale: { x: 2, y: 0.5 },
      }),
    ).toEqual({ top: 24, right: 194, bottom: 44, left: 34 });
  });
});
