import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const readSnapshotPadding = ({
  snapshot,
  propertyName,
}: {
  snapshot: ElementGeometrySnapshot;
  propertyName: string;
}): number => parseFloat(snapshot.computedStyle?.[propertyName] ?? '0') || 0;

export const resolveSnapshotContentBox = (
  snapshot: ElementGeometrySnapshot,
) => {
  const paddingLeft = readSnapshotPadding({
    snapshot,
    propertyName: 'padding-left',
  });
  const paddingTop = readSnapshotPadding({
    snapshot,
    propertyName: 'padding-top',
  });
  const paddingRight = readSnapshotPadding({
    snapshot,
    propertyName: 'padding-right',
  });
  const paddingBottom = readSnapshotPadding({
    snapshot,
    propertyName: 'padding-bottom',
  });

  return {
    x: paddingLeft,
    y: paddingTop,
    width: Math.max(0, snapshot.clientWidth - paddingLeft - paddingRight),
    height: Math.max(0, snapshot.clientHeight - paddingTop - paddingBottom),
  };
};
