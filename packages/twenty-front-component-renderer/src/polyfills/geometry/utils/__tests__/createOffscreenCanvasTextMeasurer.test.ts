import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

import { createOffscreenCanvasTextMeasurer } from '../createOffscreenCanvasTextMeasurer';

const VIEWPORT_DEFAULT_FONT_SIZE_PIXELS = 16;
const VIEWPORT_DEFAULT_FONT_SHORTHAND = `400 ${VIEWPORT_DEFAULT_FONT_SIZE_PIXELS}px Arial`;
const PRIOR_ELEMENT_FONT_SIZE_PIXELS = 40;
const PRIOR_ELEMENT_FONT_SHORTHAND = `700 ${PRIOR_ELEMENT_FONT_SIZE_PIXELS}px Inter`;

class FakeOffscreenCanvasRenderingContext2D {
  private currentFont = '10px sans-serif';

  get font(): string {
    return this.currentFont;
  }

  set font(value: string) {
    if (/\d+(?:\.\d+)?px/.test(value)) {
      this.currentFont = value;
    }
  }

  measureText(text: string) {
    const fontSizeMatch = /(\d+(?:\.\d+)?)px/.exec(this.currentFont);
    const fontSizePixels = isDefined(fontSizeMatch)
      ? Number(fontSizeMatch[1])
      : 0;

    return {
      width: text.length * fontSizePixels,
      actualBoundingBoxAscent: fontSizePixels * 0.8,
      actualBoundingBoxDescent: fontSizePixels * 0.2,
    };
  }
}

class FakeOffscreenCanvas {
  private readonly context = new FakeOffscreenCanvasRenderingContext2D();

  constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}

  getContext(contextId: string): FakeOffscreenCanvasRenderingContext2D | null {
    return contextId === '2d' ? this.context : null;
  }
}

const globalRecord = globalThis as unknown as Record<string, unknown>;

const viewportSnapshot: ViewportGeometrySnapshot = {
  innerWidth: 0,
  innerHeight: 0,
  devicePixelRatio: 1,
  scrollX: 0,
  scrollY: 0,
  rootContainerX: 0,
  rootContainerY: 0,
  rootContainerWidth: 0,
  rootContainerHeight: 0,
  rootContainerClientWidth: 0,
  rootContainerClientHeight: 0,
  defaultFontShorthand: VIEWPORT_DEFAULT_FONT_SHORTHAND,
};

const createGeometryStoreStub = (): WorkerGeometryStore => ({
  setRootElement: () => undefined,
  connectTransport: () => undefined,
  applyGeometryBatch: () => undefined,
  getViewportSnapshot: () => viewportSnapshot,
  resolveMirroredElementState: () => ({ isMirrored: false, snapshot: null }),
  resolveElementByRemoteElementId: () => null,
});

const createElement = (
  textContent: string,
  fontDeclarations: Record<string, string>,
) => ({
  textContent,
  style: {
    getPropertyValue: (propertyName: string) =>
      fontDeclarations[propertyName] ?? '',
  },
});

describe('createOffscreenCanvasTextMeasurer', () => {
  let originalOffscreenCanvas: unknown;

  beforeAll(() => {
    originalOffscreenCanvas = globalRecord.OffscreenCanvas;
    globalRecord.OffscreenCanvas = FakeOffscreenCanvas;
  });

  afterAll(() => {
    globalRecord.OffscreenCanvas = originalOffscreenCanvas;
  });

  it('should not adopt a prior element font when the font shorthand is a CSS-wide keyword', () => {
    const measureElementText = createOffscreenCanvasTextMeasurer(
      createGeometryStoreStub(),
    );

    expect(measureElementText).not.toBeNull();

    const priorGeometry = measureElementText?.(
      createElement('AB', { font: PRIOR_ELEMENT_FONT_SHORTHAND }),
    );
    const inheritingGeometry = measureElementText?.(
      createElement('AB', { font: 'inherit' }),
    );

    expect(priorGeometry?.width).toBe(2 * PRIOR_ELEMENT_FONT_SIZE_PIXELS);
    expect(inheritingGeometry?.width).toBe(
      2 * VIEWPORT_DEFAULT_FONT_SIZE_PIXELS,
    );
  });

  it('should reset to the viewport default when an assembled shorthand is rejected by the canvas', () => {
    const measureElementText = createOffscreenCanvasTextMeasurer(
      createGeometryStoreStub(),
    );

    measureElementText?.(
      createElement('AB', { font: PRIOR_ELEMENT_FONT_SHORTHAND }),
    );
    const inheritingGeometry = measureElementText?.(
      createElement('AB', { 'font-size': 'inherit' }),
    );

    expect(inheritingGeometry?.width).toBe(
      2 * VIEWPORT_DEFAULT_FONT_SIZE_PIXELS,
    );
  });
});
