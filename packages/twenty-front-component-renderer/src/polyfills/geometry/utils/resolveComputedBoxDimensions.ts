import { type SnapshotBoxDimensions } from '@/polyfills/geometry/types/SnapshotBoxDimensions';
import { readSnapshotBorderWidths } from '@/polyfills/geometry/utils/readSnapshotBorderWidths';
import { readSnapshotComputedLength } from '@/polyfills/geometry/utils/readSnapshotComputedLength';
import { readSnapshotPadding } from '@/polyfills/geometry/utils/readSnapshotPadding';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const SCROLLABLE_OVERFLOW_VALUES: ReadonlySet<string> = new Set([
  'auto',
  'scroll',
]);

const hasLayoutBox = ({
  offsetWidth,
  offsetHeight,
  width,
  height,
}: ElementGeometrySnapshot): boolean =>
  offsetWidth > 0 || offsetHeight > 0 || width > 0 || height > 0;

const readScrollbarThickness = ({
  overflow,
  borderBoxSize,
  borderSize,
  clientSize,
}: {
  overflow: string | undefined;
  borderBoxSize: number;
  borderSize: number;
  clientSize: number;
}): number =>
  SCROLLABLE_OVERFLOW_VALUES.has(overflow ?? '')
    ? Math.max(0, Math.round(borderBoxSize - borderSize - clientSize))
    : 0;

export const resolveComputedBoxDimensions = (
  snapshot: ElementGeometrySnapshot,
): SnapshotBoxDimensions | null => {
  const computedWidth = readSnapshotComputedLength({
    snapshot,
    propertyName: 'width',
  });
  const computedHeight = readSnapshotComputedLength({
    snapshot,
    propertyName: 'height',
  });

  if (
    !hasLayoutBox(snapshot) ||
    !Number.isFinite(computedWidth) ||
    !Number.isFinite(computedHeight)
  ) {
    return null;
  }

  const padding = readSnapshotPadding(snapshot);
  const borderWidths = readSnapshotBorderWidths(snapshot);
  const horizontalEdges =
    padding.left + padding.right + borderWidths.left + borderWidths.right;
  const verticalEdges =
    padding.top + padding.bottom + borderWidths.top + borderWidths.bottom;
  const verticalScrollbarWidth = readScrollbarThickness({
    overflow: snapshot.computedStyle?.['overflow-y'],
    borderBoxSize: snapshot.offsetWidth,
    borderSize: borderWidths.left + borderWidths.right,
    clientSize: snapshot.clientWidth,
  });
  const horizontalScrollbarHeight = readScrollbarThickness({
    overflow: snapshot.computedStyle?.['overflow-x'],
    borderBoxSize: snapshot.offsetHeight,
    borderSize: borderWidths.top + borderWidths.bottom,
    clientSize: snapshot.clientHeight,
  });
  const isBorderBoxSizing =
    snapshot.computedStyle?.['box-sizing'] === 'border-box';
  const contentWidth = Math.max(
    0,
    computedWidth -
      (isBorderBoxSizing ? horizontalEdges : 0) -
      verticalScrollbarWidth,
  );
  const contentHeight = Math.max(
    0,
    computedHeight -
      (isBorderBoxSizing ? verticalEdges : 0) -
      horizontalScrollbarHeight,
  );

  return {
    contentBox: {
      x: padding.left,
      y: padding.top,
      width: contentWidth,
      height: contentHeight,
    },
    borderBox: {
      width: contentWidth + horizontalEdges + verticalScrollbarWidth,
      height: contentHeight + verticalEdges + horizontalScrollbarHeight,
    },
  };
};
