import { isNavigationUrlAttribute } from '../isNavigationUrlAttribute';

describe('isNavigationUrlAttribute', () => {
  it('should treat anchor href and xlink:href as navigation attributes', () => {
    expect(isNavigationUrlAttribute('a', 'href')).toBe(true);
    expect(isNavigationUrlAttribute('a', 'xlink:href')).toBe(true);
    expect(isNavigationUrlAttribute('a', 'xlinkHref')).toBe(true);
  });

  it('should ignore casing of the tag and the attribute', () => {
    expect(isNavigationUrlAttribute('A', 'HREF')).toBe(true);
  });

  it('should treat form action and formaction as navigation attributes', () => {
    expect(isNavigationUrlAttribute('area', 'href')).toBe(true);
    expect(isNavigationUrlAttribute('form', 'action')).toBe(true);
    expect(isNavigationUrlAttribute('button', 'formaction')).toBe(true);
    expect(isNavigationUrlAttribute('input', 'formaction')).toBe(true);
  });

  it('should not treat resource-loading attributes as navigation', () => {
    expect(isNavigationUrlAttribute('img', 'src')).toBe(false);
    expect(isNavigationUrlAttribute('a', 'src')).toBe(false);
    expect(isNavigationUrlAttribute('image', 'xlink:href')).toBe(false);
  });

  it('should not match attributes on unrelated tags', () => {
    expect(isNavigationUrlAttribute('div', 'href')).toBe(false);
    expect(isNavigationUrlAttribute('a', 'action')).toBe(false);
  });
});
