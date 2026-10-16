import { type SnapshotBoxDimensions } from '@/polyfills/geometry/types/SnapshotBoxDimensions';
import { readSnapshotPadding } from '@/polyfills/geometry/utils/readSnapshotPadding';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const resolveClientBoxDimensions = (
  snapshot: ElementGeometrySnapshot,
): SnapshotBoxDimensions => {
  const padding = readSnapshotPadding(snapshot);

  return {
    contentBox: {
      x: padding.left,
      y: padding.top,
      width: Math.max(0, snapshot.clientWidth - padding.left - padding.right),
      height: Math.max(0, snapshot.clientHeight - padding.top - padding.bottom),
    },
    borderBox: { width: snapshot.offsetWidth, height: snapshot.offsetHeight },
  };
};
