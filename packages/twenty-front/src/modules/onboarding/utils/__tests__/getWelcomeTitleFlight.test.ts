import { getWelcomeTitleFlight } from '@/onboarding/utils/getWelcomeTitleFlight';

const buildRect = (
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  }) as DOMRect;

describe('getWelcomeTitleFlight', () => {
  it('should translate from where the text starts, not from the pill edge', () => {
    const flight = getWelcomeTitleFlight({
      sourceRect: buildRect(100, 200, 400, 80),
      sourcePaddingLeftInPx: 32,
      sourceFontSizeInPx: 26,
      targetRect: buildRect(24, 40, 300, 24),
      targetFontSizeInPx: 26,
    });

    expect(flight.translateXInPx).toBe(24 - (100 + 32));
  });

  it('should align the vertical centers of source and target', () => {
    const flight = getWelcomeTitleFlight({
      sourceRect: buildRect(0, 200, 400, 80),
      sourcePaddingLeftInPx: 0,
      sourceFontSizeInPx: 26,
      targetRect: buildRect(0, 40, 300, 24),
      targetFontSizeInPx: 26,
    });

    expect(flight.translateYInPx).toBe(52 - 240);
  });

  it('should scale by the font size ratio', () => {
    const flight = getWelcomeTitleFlight({
      sourceRect: buildRect(0, 0, 400, 80),
      sourcePaddingLeftInPx: 0,
      sourceFontSizeInPx: 26,
      targetRect: buildRect(0, 0, 300, 24),
      targetFontSizeInPx: 13,
    });

    expect(flight.scale).toBe(0.5);
  });

  it('should anchor the transform origin on the text start', () => {
    const flight = getWelcomeTitleFlight({
      sourceRect: buildRect(0, 0, 400, 80),
      sourcePaddingLeftInPx: 32,
      sourceFontSizeInPx: 26,
      targetRect: buildRect(0, 0, 300, 24),
      targetFontSizeInPx: 26,
    });

    expect(flight.transformOriginXInPx).toBe(32);
  });

  it('should fall back to a neutral scale when the source font size is unreadable', () => {
    const flight = getWelcomeTitleFlight({
      sourceRect: buildRect(0, 0, 400, 80),
      sourcePaddingLeftInPx: 0,
      sourceFontSizeInPx: 0,
      targetRect: buildRect(0, 0, 300, 24),
      targetFontSizeInPx: 16,
    });

    expect(flight.scale).toBe(1);
  });
});
