import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type GeometryUpdateBatch = {
  viewport?: ViewportGeometrySnapshot;
  elements?: Record<string, ElementGeometrySnapshot>;
  removedRemoteElementIds?: string[];
};
