import { measureNodeGeometry } from '../measureNodeGeometry';

const ROOT_ORIGIN = { x: 0, y: 0 };

const NO_MIRRORED_PARENT = () => null;

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

    const snapshot = measureNodeGeometry(node, ROOT_ORIGIN, NO_MIRRORED_PARENT);

    expect(snapshot.x).toBe(5);
    expect(snapshot.y).toBe(6);
    expect(snapshot.width).toBe(7);
    expect(snapshot.height).toBe(8);
  });

  it('should compute offsets relative to the root container origin', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetParent', {
      value: document.createElement('div'),
    });

    const snapshot = measureNodeGeometry(
      node,
      { x: 2, y: 4 },
      NO_MIRRORED_PARENT,
    );

    expect(snapshot.offsetLeft).toBe(3);
    expect(snapshot.offsetTop).toBe(2);
  });

  it('should keep host offsets and carry the parent id for a mirrored offset parent', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    const offsetParentNode = document.createElement('div');
    Object.defineProperty(node, 'offsetParent', { value: offsetParentNode });
    Object.defineProperty(node, 'offsetTop', { value: 11 });
    Object.defineProperty(node, 'offsetLeft', { value: 12 });

    const snapshot = measureNodeGeometry(node, { x: 2, y: 4 }, (parentNode) =>
      parentNode === offsetParentNode ? '9' : null,
    );

    expect(snapshot.offsetParentRemoteElementId).toBe('9');
    expect(snapshot.offsetTop).toBe(11);
    expect(snapshot.offsetLeft).toBe(12);
  });

  it("should report the element's own offsets when it has no offset parent", () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetParent', { value: null });
    Object.defineProperty(node, 'offsetTop', { value: 15 });
    Object.defineProperty(node, 'offsetLeft', { value: 16 });

    const snapshot = measureNodeGeometry(
      node,
      { x: 2, y: 4 },
      NO_MIRRORED_PARENT,
    );

    expect(snapshot.offsetParentRemoteElementId).toBeNull();
    expect(snapshot.offsetTop).toBe(15);
    expect(snapshot.offsetLeft).toBe(16);
  });

  it('should fall back to root relative offsets for an unmirrored offset parent', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetParent', {
      value: document.createElement('div'),
    });

    const snapshot = measureNodeGeometry(
      node,
      { x: 2, y: 4 },
      NO_MIRRORED_PARENT,
    );

    expect(snapshot.offsetParentRemoteElementId).toBeNull();
    expect(snapshot.offsetLeft).toBe(3);
    expect(snapshot.offsetTop).toBe(2);
  });

  it('should read the offset sizes from an html element', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetWidth', { value: 42 });

    expect(
      measureNodeGeometry(node, ROOT_ORIGIN, NO_MIRRORED_PARENT).offsetWidth,
    ).toBe(42);
  });

  it('should report zero offset sizes for an svg element', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry(node, ROOT_ORIGIN, NO_MIRRORED_PARENT);

    expect(snapshot.offsetWidth).toBe(0);
    expect(snapshot.offsetHeight).toBe(0);
  });
});
