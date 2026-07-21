import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type GeometryMeasureResult = {
  viewport: ViewportGeometrySnapshot;
  elements: Record<string, ElementGeometrySnapshot>;
};
