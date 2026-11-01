import { createDomRectFromSnapshot } from '@/polyfills/geometry/utils/createDomRectFromSnapshot';
import { resolveResizeObserverBoxSize } from '@/polyfills/geometry/utils/resolveResizeObserverBoxSize';
import { resolveSnapshotBoxDimensions } from '@/polyfills/geometry/utils/resolveSnapshotBoxDimensions';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

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
  const createBoxSizes = (box: ResizeObserverBoxOptions) =>
    Object.freeze([
      resolveResizeObserverBoxSize({ snapshot, box, devicePixelRatio }),
    ]);

  return {
    target,
    contentRect: createDomRectFromSnapshot(
      resolveSnapshotBoxDimensions(snapshot).contentBox,
    ),
    contentBoxSize: createBoxSizes('content-box'),
    borderBoxSize: createBoxSizes('border-box'),
    devicePixelContentBoxSize: createBoxSizes('device-pixel-content-box'),
  };
};
