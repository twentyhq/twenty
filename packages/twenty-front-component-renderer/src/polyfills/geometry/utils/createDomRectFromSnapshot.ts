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

  const top = y;
  const left = x;
  const right = x + width;
  const bottom = y + height;

  return {
    x,
    y,
    width,
    height,
    top,
    left,
    right,
    bottom,
    toJSON: () => ({ x, y, width, height, top, left, right, bottom }),
  } as unknown as DOMRect;
};
