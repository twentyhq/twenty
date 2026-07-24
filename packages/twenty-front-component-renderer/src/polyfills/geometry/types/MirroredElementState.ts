import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export type MirroredElementState = {
  isMirrored: boolean;
  snapshot: ElementGeometrySnapshot | null;
};
