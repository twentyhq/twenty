import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { isDefined } from 'twenty-shared/utils';

const FALLBACK_LINE_HEIGHT_RATIO = 1.4;
const FALLBACK_DESCENT_RATIO = 0.2;

type TextDimensions = {
  width: number;
  height: number;
};

const textCache = new Map<string, TextDimensions>();
let cachedCanvas: HTMLCanvasElement | null = null;

const getCanvasContext = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!cachedCanvas) {
    cachedCanvas = document.createElement('canvas');
  }

  return cachedCanvas.getContext('2d');
};

const getCacheKey = (text: string, fontSize: number, fontFamily?: string) =>
  `${fontSize}px:${fontFamily ?? 'sans-serif'}:${text}`;

export const measureTextDimensions = ({
  text,
  fontSize,
  fontFamily,
}: {
  text: string;
  fontSize: number;
  fontFamily?: string;
}): TextDimensions => {
  if (!text) {
    return { width: 0, height: 0 };
  }

  const cacheKey = getCacheKey(text, fontSize, fontFamily);
  const cached = textCache.get(cacheKey);
  if (isDefined(cached)) {
    return cached;
  }

  const context = getCanvasContext();
  if (!context) {
    const fallbackWidth =
      text.length *
      fontSize *
      COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
    const fallbackHeight = fontSize * FALLBACK_LINE_HEIGHT_RATIO;
    const fallback = { width: fallbackWidth, height: fallbackHeight };
    textCache.set(cacheKey, fallback);
    return fallback;
  }

  context.font = `${fontSize}px ${fontFamily ?? 'sans-serif'}`;
  const metrics = context.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent ?? fontSize;
  const descent =
    metrics.actualBoundingBoxDescent ?? fontSize * FALLBACK_DESCENT_RATIO;
  const dimensions = { width: metrics.width, height: ascent + descent };
  textCache.set(cacheKey, dimensions);

  return dimensions;
};
