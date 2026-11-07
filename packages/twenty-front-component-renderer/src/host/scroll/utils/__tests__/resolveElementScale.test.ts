import { resolveElementScale } from '@/host/scroll/utils/resolveElementScale';

const createElementWithSizes = ({
  renderedWidth,
  renderedHeight,
  offsetWidth,
  offsetHeight,
}: {
  renderedWidth: number;
  renderedHeight: number;
  offsetWidth: number;
  offsetHeight: number;
}) => {
  const element = document.createElement('div');

  element.getBoundingClientRect = () =>
    new DOMRect(0, 0, renderedWidth, renderedHeight);
  Object.defineProperty(element, 'offsetWidth', { value: offsetWidth });
  Object.defineProperty(element, 'offsetHeight', { value: offsetHeight });

  return element;
};

describe('resolveElementScale', () => {
  it('should resolve the ratio of the rendered size to the layout size on each axis', () => {
    expect(
      resolveElementScale(
        createElementWithSizes({
          renderedWidth: 200,
          renderedHeight: 50,
          offsetWidth: 100,
          offsetHeight: 100,
        }),
      ),
    ).toEqual({ x: 2, y: 0.5 });
  });

  it('should resolve an unscaled element to one on each axis', () => {
    expect(
      resolveElementScale(
        createElementWithSizes({
          renderedWidth: 100,
          renderedHeight: 40,
          offsetWidth: 100,
          offsetHeight: 40,
        }),
      ),
    ).toEqual({ x: 1, y: 1 });
  });

  it.each([
    {
      reason: 'the layout size is zero',
      sizes: {
        renderedWidth: 200,
        renderedHeight: 50,
        offsetWidth: 0,
        offsetHeight: 0,
      },
    },
    {
      reason: 'the layout size is negative',
      sizes: {
        renderedWidth: 200,
        renderedHeight: 50,
        offsetWidth: -100,
        offsetHeight: -100,
      },
    },
    {
      reason: 'the rendered size is zero',
      sizes: {
        renderedWidth: 0,
        renderedHeight: 0,
        offsetWidth: 100,
        offsetHeight: 100,
      },
    },
    {
      reason: 'the ratio is not finite',
      sizes: {
        renderedWidth: Number.POSITIVE_INFINITY,
        renderedHeight: Number.NaN,
        offsetWidth: 100,
        offsetHeight: 100,
      },
    },
    {
      reason: 'the layout size is not a number',
      sizes: {
        renderedWidth: 200,
        renderedHeight: 50,
        offsetWidth: Number.NaN,
        offsetHeight: Number.NaN,
      },
    },
  ])('should fall back to one when $reason', ({ sizes }) => {
    expect(resolveElementScale(createElementWithSizes(sizes))).toEqual({
      x: 1,
      y: 1,
    });
  });

  it('should fall back to one when the element has no layout size', () => {
    const svgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );

    svgElement.getBoundingClientRect = () => new DOMRect(0, 0, 200, 50);

    expect(resolveElementScale(svgElement)).toEqual({ x: 1, y: 1 });
  });
});
