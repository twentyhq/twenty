import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { createDomRectFromSnapshot } from '@/polyfills/geometry/utils/createDomRectFromSnapshot';

const DEFAULT_WRITING_MODE = 'horizontal-tb';

type CreateResizeObserverEntryInput = {
  target: Element;
  snapshot: ElementGeometrySnapshot;
  devicePixelRatio: number;
};

export const createResizeObserverEntry = ({
  target,
  snapshot,
  devicePixelRatio,
}: CreateResizeObserverEntryInput): ResizeObserverEntry => {
  const width = snapshot.contentWidth ?? snapshot.clientWidth;
  const height = snapshot.contentHeight ?? snapshot.clientHeight;
  const writingMode =
    snapshot.computedStyle?.['writing-mode'] ?? DEFAULT_WRITING_MODE;
  const isVerticalWritingMode =
    writingMode.startsWith('vertical') || writingMode.startsWith('sideways');
  const createBoxSize = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }): ResizeObserverSize =>
    Object.freeze({
      inlineSize: isVerticalWritingMode ? height : width,
      blockSize: isVerticalWritingMode ? width : height,
    });

  return {
    target,
    contentRect: createDomRectFromSnapshot({
      x: parseFloat(snapshot.computedStyle?.['padding-left'] ?? '0') || 0,
      y: parseFloat(snapshot.computedStyle?.['padding-top'] ?? '0') || 0,
      width,
      height,
    }),
    contentBoxSize: Object.freeze([createBoxSize({ width, height })]),
    borderBoxSize: Object.freeze([
      createBoxSize({
        width: snapshot.offsetWidth,
        height: snapshot.offsetHeight,
      }),
    ]),
    devicePixelContentBoxSize: Object.freeze([
      createBoxSize({
        width: Math.round(width * devicePixelRatio),
        height: Math.round(height * devicePixelRatio),
      }),
    ]),
  };
};
