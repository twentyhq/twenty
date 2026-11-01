import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export type ElementGeometryReader = {
  read: () => ElementGeometrySnapshot | null;
  release: () => void;
};
