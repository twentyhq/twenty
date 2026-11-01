import { readSnapshotComputedLength } from '@/polyfills/geometry/utils/readSnapshotComputedLength';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const readSnapshotPadding = (snapshot: ElementGeometrySnapshot) => {
  const readPadding = (propertyName: string) =>
    readSnapshotComputedLength({ snapshot, propertyName }) || 0;

  return {
    left: readPadding('padding-left'),
    top: readPadding('padding-top'),
    right: readPadding('padding-right'),
    bottom: readPadding('padding-bottom'),
  };
};
