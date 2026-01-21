import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';

describe('measureTextDimensions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns zero dimensions for undefined text', () => {
    const result = measureTextDimensions({
      text: undefined as unknown as string,
      fontSize: 12,
    });

    expect(result).toEqual({ width: 0, height: 0 });
  });

  it('returns positive dimensions for valid text', () => {
    const result = measureTextDimensions({
      text: 'Hello',
      fontSize: 12,
    });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('scales dimensions with font size', () => {
    const small = measureTextDimensions({ text: 'ScaleTest', fontSize: 10 });
    const large = measureTextDimensions({ text: 'ScaleTest', fontSize: 20 });

    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });

  it('scales width with text length', () => {
    const short = measureTextDimensions({ text: 'X', fontSize: 14 });
    const long = measureTextDimensions({ text: 'XXXXXXXXXX', fontSize: 14 });

    expect(long.width).toBeGreaterThan(short.width);
  });

  it('uses fallback calculation when canvas context unavailable', () => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const text = 'FallbackTest';
    const fontSize = 10;

    const result = measureTextDimensions({ text, fontSize });

    const expectedFallbackWidth =
      text.length *
      fontSize *
      COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;

    expect(result.width).toBeCloseTo(expectedFallbackWidth, 0);
  });

  it('returns cached result for identical inputs', () => {
    const measureText = jest.fn().mockReturnValue({
      width: 42,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2,
    });
    const context = {
      measureText,
      font: '',
    } as unknown as CanvasRenderingContext2D;

    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(context);

    const params = { text: 'CacheTest', fontSize: 16 };

    const first = measureTextDimensions(params);
    const second = measureTextDimensions(params);

    expect(measureText).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});
