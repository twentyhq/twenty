import { type SnapshotBoxDimensions } from '@/polyfills/geometry/types/SnapshotBoxDimensions';
import { resolveClientBoxDimensions } from '@/polyfills/geometry/utils/resolveClientBoxDimensions';
import { resolveComputedBoxDimensions } from '@/polyfills/geometry/utils/resolveComputedBoxDimensions';
import { resolveSvgBoxDimensions } from '@/polyfills/geometry/utils/resolveSvgBoxDimensions';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const resolveSnapshotBoxDimensions = (
  snapshot: ElementGeometrySnapshot,
): SnapshotBoxDimensions =>
  resolveSvgBoxDimensions(snapshot) ??
  resolveComputedBoxDimensions(snapshot) ??
  resolveClientBoxDimensions(snapshot);
