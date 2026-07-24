import { createDomRectFromSnapshot } from '../createDomRectFromSnapshot';

describe('createDomRectFromSnapshot', () => {
  it('should return a zero rect for a null snapshot', () => {
    const rect = createDomRectFromSnapshot(null);

    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('should derive the edge fields from x, y, width and height', () => {
    const rect = createDomRectFromSnapshot({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });

    expect(rect.top).toBe(20);
    expect(rect.left).toBe(10);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
  });

  it('should return a new object on each call', () => {
    const snapshot = { x: 0, y: 0, width: 1, height: 1 };

    expect(createDomRectFromSnapshot(snapshot)).not.toBe(
      createDomRectFromSnapshot(snapshot),
    );
  });
});
