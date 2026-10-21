import { measureSvgBoundingBox } from '../measureSvgBoundingBox';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const createSvgGraphicsInsideSvg = () => {
  const outerSvg = document.createElementNS(SVG_NAMESPACE, 'svg');
  const graphics = document.createElementNS(SVG_NAMESPACE, 'svg');
  outerSvg.append(graphics);

  return { outerSvg, graphics };
};

const stubBoundingBox = ({
  node,
  boundingBox,
}: {
  node: Element;
  boundingBox: { x: number; y: number; width: number; height: number };
}) => {
  Object.defineProperty(node, 'getBBox', { value: () => boundingBox });
};

describe('measureSvgBoundingBox', () => {
  it('returns null for html elements', () => {
    expect(measureSvgBoundingBox(document.createElement('div'))).toBeNull();
  });

  it('returns null for the outermost svg element', () => {
    const { outerSvg } = createSvgGraphicsInsideSvg();
    stubBoundingBox({
      node: outerSvg,
      boundingBox: { x: 0, y: 0, width: 200, height: 120 },
    });

    expect(measureSvgBoundingBox(outerSvg)).toBeNull();
  });

  it('measures the bounding box of graphics inside an svg element', () => {
    const { graphics } = createSvgGraphicsInsideSvg();
    stubBoundingBox({
      node: graphics,
      boundingBox: { x: 10, y: 20, width: 80, height: 40 },
    });

    expect(measureSvgBoundingBox(graphics)).toEqual({ width: 80, height: 40 });
  });

  it('returns null when the graphics are not rendered', () => {
    const { graphics } = createSvgGraphicsInsideSvg();
    Object.defineProperty(graphics, 'getBBox', {
      value: () => {
        throw new Error('The element is not rendered');
      },
    });

    expect(measureSvgBoundingBox(graphics)).toBeNull();
  });
});
