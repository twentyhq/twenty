import { measureNodeGeometry } from '../measureNodeGeometry';

const ROOT_ORIGIN = { x: 0, y: 0 };

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

    const snapshot = measureNodeGeometry(node, ROOT_ORIGIN);

    expect(snapshot.x).toBe(5);
    expect(snapshot.y).toBe(6);
    expect(snapshot.width).toBe(7);
    expect(snapshot.height).toBe(8);
  });

  it('should compute offsets relative to the root container origin', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry(node, { x: 2, y: 4 });

    expect(snapshot.offsetLeft).toBe(3);
    expect(snapshot.offsetTop).toBe(2);
  });

  it('should read the offset sizes from an html element', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetWidth', { value: 42 });

    expect(measureNodeGeometry(node, ROOT_ORIGIN).offsetWidth).toBe(42);
  });

  it('should report zero offset sizes for an svg element', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry(node, ROOT_ORIGIN);

    expect(snapshot.offsetWidth).toBe(0);
    expect(snapshot.offsetHeight).toBe(0);
  });
});
