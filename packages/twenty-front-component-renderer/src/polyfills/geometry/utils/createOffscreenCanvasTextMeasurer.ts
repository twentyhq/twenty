import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_CANVAS_FONT_SHORTHAND } from '@/polyfills/geometry/constants/DefaultCanvasFontShorthand';
import { DEFAULT_LINE_HEIGHT_RATIO } from '@/polyfills/geometry/constants/DefaultLineHeightRatio';
import { type TextGeometry } from '@/polyfills/geometry/types/TextGeometry';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { buildCanvasFontFromElement } from '@/polyfills/geometry/utils/buildCanvasFontFromElement';

type ElementWithTextContent = {
  textContent?: unknown;
};

const parseFontSizeInPixels = (fontShorthand: string): number => {
  const fontSizeMatch = /(\d+(?:\.\d+)?)px/.exec(fontShorthand);

  return isDefined(fontSizeMatch) ? Number(fontSizeMatch[1]) : 13;
};

export const createOffscreenCanvasTextMeasurer = (
  geometryStore: WorkerGeometryStore,
): ((element: object) => TextGeometry | null) | null => {
  if (typeof OffscreenCanvas !== 'function') {
    return null;
  }

  let canvasContext: OffscreenCanvasRenderingContext2D | null = null;

  const resolveCanvasContext = (): OffscreenCanvasRenderingContext2D | null => {
    if (isDefined(canvasContext)) {
      return canvasContext;
    }

    try {
      canvasContext = new OffscreenCanvas(1, 1).getContext('2d');
    } catch {
      canvasContext = null;
    }

    return canvasContext;
  };

  return (element: object): TextGeometry | null => {
    const textContent = (element as ElementWithTextContent).textContent;

    if (!isNonEmptyString(textContent)) {
      return null;
    }

    const context = resolveCanvasContext();

    if (!isDefined(context)) {
      return null;
    }

    const defaultFontShorthand =
      geometryStore.getViewportSnapshot()?.defaultFontShorthand ??
      DEFAULT_CANVAS_FONT_SHORTHAND;

    const fontShorthand = buildCanvasFontFromElement(
      element,
      defaultFontShorthand,
    );

    try {
      context.font = fontShorthand;

      const metrics = context.measureText(textContent);
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;
      const hasVerticalMetrics =
        Number.isFinite(ascent) &&
        Number.isFinite(descent) &&
        ascent + descent > 0;

      return {
        width: metrics.width,
        height: hasVerticalMetrics
          ? ascent + descent
          : parseFontSizeInPixels(fontShorthand) * DEFAULT_LINE_HEIGHT_RATIO,
      };
    } catch {
      return null;
    }
  };
};
