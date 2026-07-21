import { measureNodeGeometry } from '../measureNodeGeometry';

const stubBoundingClientRect = (node: Element) => {
  node.getBoundingClientRect = () =>
    ({
      x: 5,
      y: 6,
      width: 7,
      height: 8,
      top: 6,
      left: 5,
      right: 12,
      bottom: 14,
      toJSON: () => ({}),
    }) as DOMRect;
};

describe('measureNodeGeometry', () => {
  it('should read the bounding rect fields', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry(node);

    expect(snapshot.x).toBe(5);
    expect(snapshot.y).toBe(6);
    expect(snapshot.width).toBe(7);
    expect(snapshot.height).toBe(8);
  });

  it('should read the offset fields from an html element', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetWidth', { value: 42 });

    expect(measureNodeGeometry(node).offsetWidth).toBe(42);
  });

  it('should report zero offset fields for an svg element', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry(node);

    expect(snapshot.offsetWidth).toBe(0);
    expect(snapshot.offsetHeight).toBe(0);
    expect(snapshot.offsetTop).toBe(0);
    expect(snapshot.offsetLeft).toBe(0);
  });
});
