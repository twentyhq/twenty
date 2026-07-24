import { buildCanvasFontFromElement } from '../buildCanvasFontFromElement';

const DEFAULT_FONT = '400 13px sans-serif';

const createElementWithStyle = (declarations: Record<string, string>) => ({
  style: {
    getPropertyValue: (propertyName: string) =>
      declarations[propertyName] ?? '',
  },
});

describe('buildCanvasFontFromElement', () => {
  it('should prefer the font shorthand', () => {
    expect(
      buildCanvasFontFromElement(
        createElementWithStyle({ font: '700 20px Inter' }),
        DEFAULT_FONT,
      ),
    ).toBe('700 20px Inter');
  });

  it('should assemble the shorthand from longhands', () => {
    expect(
      buildCanvasFontFromElement(
        createElementWithStyle({
          'font-style': 'italic',
          'font-weight': '600',
          'font-size': '14px',
          'line-height': '20px',
          'font-family': 'Inter',
        }),
        DEFAULT_FONT,
      ),
    ).toBe('italic 600 14px/20px Inter');
  });

  it('should keep a standalone font weight with fallback size and family', () => {
    expect(
      buildCanvasFontFromElement(
        createElementWithStyle({ 'font-weight': '700' }),
        DEFAULT_FONT,
      ),
    ).toBe('700 13px sans-serif');
  });

  it('should treat a CSS-wide keyword font shorthand as absent', () => {
    expect(
      buildCanvasFontFromElement(
        createElementWithStyle({ font: 'inherit' }),
        DEFAULT_FONT,
      ),
    ).toBe(DEFAULT_FONT);
  });

  it('should ignore CSS-wide keyword casing and whitespace', () => {
    expect(
      buildCanvasFontFromElement(
        createElementWithStyle({ font: '  Inherit  ' }),
        DEFAULT_FONT,
      ),
    ).toBe(DEFAULT_FONT);
  });

  it('should return the default when no font property is declared', () => {
    expect(
      buildCanvasFontFromElement(createElementWithStyle({}), DEFAULT_FONT),
    ).toBe(DEFAULT_FONT);
  });

  it('should return the default for an element without a style', () => {
    expect(buildCanvasFontFromElement({}, DEFAULT_FONT)).toBe(DEFAULT_FONT);
  });
});
