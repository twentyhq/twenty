import { resolveSnapshotBoxDimensions } from '@/polyfills/geometry/utils/resolveSnapshotBoxDimensions';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const DEFAULT_WRITING_MODE = 'horizontal-tb';

type ResolveResizeObserverBoxSizeInput = {
  snapshot: ElementGeometrySnapshot;
  box: ResizeObserverBoxOptions;
  devicePixelRatio: number;
};

const resolveBoxDimensions = ({
  snapshot,
  box,
  devicePixelRatio,
}: ResolveResizeObserverBoxSizeInput): { width: number; height: number } => {
  const { contentBox, borderBox } = resolveSnapshotBoxDimensions(snapshot);

  if (box === 'border-box') {
    return borderBox;
  }

  if (box === 'device-pixel-content-box') {
    return {
      width: Math.round(contentBox.width * devicePixelRatio),
      height: Math.round(contentBox.height * devicePixelRatio),
    };
  }

  return contentBox;
};

export const resolveResizeObserverBoxSize = (
  input: ResolveResizeObserverBoxSizeInput,
): ResizeObserverSize => {
  const { width, height } = resolveBoxDimensions(input);
  const writingMode =
    input.snapshot.computedStyle?.['writing-mode'] ?? DEFAULT_WRITING_MODE;
  const isVerticalWritingMode =
    writingMode.startsWith('vertical') || writingMode.startsWith('sideways');

  return Object.freeze({
    inlineSize: isVerticalWritingMode ? height : width,
    blockSize: isVerticalWritingMode ? width : height,
  });
};
