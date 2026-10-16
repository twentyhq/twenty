import { measureNodeGeometry } from '../measureNodeGeometry';

const ROOT_ORIGIN = { x: 0, y: 0 };
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

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

    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
    });

    expect(snapshot.x).toBe(5);
    expect(snapshot.y).toBe(6);
    expect(snapshot.width).toBe(7);
    expect(snapshot.height).toBe(8);
  });

  it('should compute offsets relative to the root container origin', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: { x: 2, y: 4 },
    });

    expect(snapshot.offsetLeft).toBe(3);
    expect(snapshot.offsetTop).toBe(2);
  });

  it('should read the client and scroll fields', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'clientWidth', { value: 21 });
    Object.defineProperty(node, 'clientHeight', { value: 22 });
    Object.defineProperty(node, 'clientTop', { value: 1 });
    Object.defineProperty(node, 'clientLeft', { value: 2 });
    Object.defineProperty(node, 'scrollWidth', { value: 31 });
    Object.defineProperty(node, 'scrollHeight', { value: 32 });
    Object.defineProperty(node, 'scrollTop', { value: 3 });
    Object.defineProperty(node, 'scrollLeft', { value: 4 });

    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
    });

    expect(snapshot.clientWidth).toBe(21);
    expect(snapshot.clientHeight).toBe(22);
    expect(snapshot.clientTop).toBe(1);
    expect(snapshot.clientLeft).toBe(2);
    expect(snapshot.scrollWidth).toBe(31);
    expect(snapshot.scrollHeight).toBe(32);
    expect(snapshot.scrollTop).toBe(3);
    expect(snapshot.scrollLeft).toBe(4);
  });

  it('should read the offset sizes from an html element', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetWidth', { value: 42 });
    Object.defineProperty(node, 'offsetHeight', { value: 43 });

    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
    });

    expect(snapshot.offsetWidth).toBe(42);
    expect(snapshot.offsetHeight).toBe(43);
  });

  it('should report zero offset sizes for an svg element', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stubBoundingClientRect(node);

    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
    });

    expect(snapshot.offsetWidth).toBe(0);
    expect(snapshot.offsetHeight).toBe(0);
  });
  it('preserves native offset ancestry instead of using viewport coordinates', () => {
    const node = document.createElement('div');
    stubBoundingClientRect(node);
    Object.defineProperty(node, 'offsetParent', {
      value: document.createElement('div'),
    });
    Object.defineProperty(node, 'offsetLeft', { value: 13 });
    Object.defineProperty(node, 'offsetTop', { value: 17 });
    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
      resolveRemoteElementId: () => 'parent',
    });
    expect(snapshot.offsetLeft).toBe(13);
    expect(snapshot.offsetTop).toBe(17);
  });

  it('measures stylesheet layout and inherited direction', () => {
    const node = document.createElement('div');
    const stylesheet = document.createElement('style');
    stylesheet.textContent =
      '.measured-layout { display: flex; column-gap: 12px; overflow: hidden; }';
    document.head.append(stylesheet);
    node.className = 'measured-layout';
    node.style.direction = 'rtl';
    document.body.append(node);
    const snapshot = measureNodeGeometry({
      node,
      rootContainerOrigin: ROOT_ORIGIN,
    });
    expect(snapshot.computedStyle).toMatchObject({
      display: 'flex',
      'column-gap': '12px',
      direction: 'rtl',
    });
    stylesheet.remove();
    node.remove();
  });

  it('measures the bounding box of SVG graphics inside an svg element', () => {
    const outerSvg = document.createElementNS(SVG_NAMESPACE, 'svg');
    const measuredGraphics = document.createElementNS(SVG_NAMESPACE, 'svg');
    const unmeasurableGraphics = document.createElementNS(SVG_NAMESPACE, 'svg');
    outerSvg.append(measuredGraphics, unmeasurableGraphics);
    Object.defineProperty(measuredGraphics, 'getBBox', {
      value: () => ({ x: 4, y: 6, width: 80, height: 40 }),
    });
    Object.defineProperty(unmeasurableGraphics, 'getBBox', {
      value: () => {
        throw new Error('The element is not rendered');
      },
    });

    const measureSvgBoundingBoxSize = (node: Element) => {
      stubBoundingClientRect(node);
      const { svgBoundingBoxWidth, svgBoundingBoxHeight } = measureNodeGeometry(
        {
          node,
          rootContainerOrigin: ROOT_ORIGIN,
        },
      );

      return { svgBoundingBoxWidth, svgBoundingBoxHeight };
    };

    expect(measureSvgBoundingBoxSize(measuredGraphics)).toEqual({
      svgBoundingBoxWidth: 80,
      svgBoundingBoxHeight: 40,
    });
    expect(measureSvgBoundingBoxSize(outerSvg)).toEqual({
      svgBoundingBoxWidth: undefined,
      svgBoundingBoxHeight: undefined,
    });
    expect(measureSvgBoundingBoxSize(unmeasurableGraphics)).toEqual({
      svgBoundingBoxWidth: undefined,
      svgBoundingBoxHeight: undefined,
    });
  });
});
