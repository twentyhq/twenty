import { readSnapshotComputedLength } from '@/polyfills/geometry/utils/readSnapshotComputedLength';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const readSnapshotBorderWidths = (snapshot: ElementGeometrySnapshot) => {
  const readBorderWidth = (propertyName: string) =>
    readSnapshotComputedLength({ snapshot, propertyName }) || 0;

  return {
    left: readBorderWidth('border-left-width'),
    top: readBorderWidth('border-top-width'),
    right: readBorderWidth('border-right-width'),
    bottom: readBorderWidth('border-bottom-width'),
  };
};
