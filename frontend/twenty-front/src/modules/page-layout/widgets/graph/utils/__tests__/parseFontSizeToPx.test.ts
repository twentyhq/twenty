import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSizeToPx';

describe('parseFontSizeToPx', () => {
  it('returns numeric font sizes as-is when valid', () => {
    expect(parseFontSizeToPx(12, 10)).toBe(12);
  });

  it('falls back on invalid numbers', () => {
    expect(parseFontSizeToPx(Number.NaN, 10)).toBe(10);
    expect(parseFontSizeToPx(-1, 10)).toBe(10);
  });

  it('parses px strings', () => {
    expect(parseFontSizeToPx('14px', 10)).toBe(14);
    expect(parseFontSizeToPx('14', 10)).toBe(14);
  });

  it('parses rem/em using root font size', () => {
    const computedStyleSpy = jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ fontSize: '20px' } as CSSStyleDeclaration);

    expect(parseFontSizeToPx('1.5rem', 10)).toBe(30);
    expect(parseFontSizeToPx('2em', 10)).toBe(40);

    computedStyleSpy.mockRestore();
  });

  it('falls back for invalid strings', () => {
    expect(parseFontSizeToPx('calc(1rem + 2px)', 11)).toBe(11);
    expect(parseFontSizeToPx('bad', 11)).toBe(11);
  });

  it('falls back when root font size is invalid', () => {
    const computedStyleSpy = jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ fontSize: 'oops' } as CSSStyleDeclaration);

    expect(parseFontSizeToPx('1rem', 10)).toBe(
      COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE,
    );

    computedStyleSpy.mockRestore();
  });
});
