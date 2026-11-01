import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const readSnapshotComputedLength = ({
  snapshot,
  propertyName,
}: {
  snapshot: ElementGeometrySnapshot;
  propertyName: string;
}): number => parseFloat(snapshot.computedStyle?.[propertyName] ?? '');
