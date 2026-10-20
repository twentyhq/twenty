import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { resolveResizeObserverBoxSize } from '@/polyfills/geometry/utils/resolveResizeObserverBoxSize';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const DEVICE_PIXEL_RATIO = 2;

const createHtmlSnapshot = (): ElementGeometrySnapshot =>
  createElementGeometrySnapshotFixture({
    width: 100,
    height: 50,
    offsetWidth: 100,
    offsetHeight: 50,
    clientWidth: 80,
    clientHeight: 30,
  });

const createSvgGraphicsSnapshot = (
  overrides: Partial<ElementGeometrySnapshot> = {},
): ElementGeometrySnapshot =>
  createElementGeometrySnapshotFixture({
    width: 80,
    height: 40,
    offsetWidth: 0,
    offsetHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    svgBoundingBoxWidth: 80,
    svgBoundingBoxHeight: 40,
    ...overrides,
  });

const resolveBoxSizes = (snapshot: ElementGeometrySnapshot) => ({
  contentBox: resolveResizeObserverBoxSize({
    snapshot,
    box: 'content-box',
    devicePixelRatio: DEVICE_PIXEL_RATIO,
  }),
  borderBox: resolveResizeObserverBoxSize({
    snapshot,
    box: 'border-box',
    devicePixelRatio: DEVICE_PIXEL_RATIO,
  }),
  devicePixelContentBox: resolveResizeObserverBoxSize({
    snapshot,
    box: 'device-pixel-content-box',
    devicePixelRatio: DEVICE_PIXEL_RATIO,
  }),
});

describe('resolveResizeObserverBoxSize', () => {
  it('reports svg graphics from their host bounding box instead of zero css boxes', () => {
    expect(resolveBoxSizes(createSvgGraphicsSnapshot())).toEqual({
      contentBox: { inlineSize: 80, blockSize: 40 },
      borderBox: { inlineSize: 80, blockSize: 40 },
      devicePixelContentBox: { inlineSize: 160, blockSize: 80 },
    });
  });

  it('follows later svg bounding box changes', () => {
    const grownSnapshot = createSvgGraphicsSnapshot({
      svgBoundingBoxWidth: 120,
    });

    expect(resolveBoxSizes(grownSnapshot).contentBox).toEqual({
      inlineSize: 120,
      blockSize: 40,
    });
  });

  it('keeps html elements on their client and offset boxes', () => {
    expect(resolveBoxSizes(createHtmlSnapshot())).toEqual({
      contentBox: { inlineSize: 80, blockSize: 30 },
      borderBox: { inlineSize: 100, blockSize: 50 },
      devicePixelContentBox: { inlineSize: 160, blockSize: 60 },
    });
  });

  it('swaps the inline and block sizes of svg graphics in vertical writing modes', () => {
    const verticalSnapshot = createSvgGraphicsSnapshot({
      computedStyle: { 'writing-mode': 'vertical-rl' },
    });

    expect(resolveBoxSizes(verticalSnapshot).contentBox).toEqual({
      inlineSize: 40,
      blockSize: 80,
    });
  });
});
