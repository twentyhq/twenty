import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export type AcknowledgedScrollPosition = {
  top: number;
  left: number;
  baseSnapshot: ElementGeometrySnapshot | null;
};
