import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type RectSnapshot = Pick<
  ElementGeometrySnapshot,
  'x' | 'y' | 'width' | 'height'
>;

export const createDomRectFromSnapshot = (
  snapshot: RectSnapshot | null,
): DOMRect => {
  const x = snapshot?.x ?? 0;
  const y = snapshot?.y ?? 0;
  const width = snapshot?.width ?? 0;
  const height = snapshot?.height ?? 0;

  if (typeof DOMRect === 'function') {
    return new DOMRect(x, y, width, height);
  }

  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({ x, y, width, height }),
  } as unknown as DOMRect;
};
