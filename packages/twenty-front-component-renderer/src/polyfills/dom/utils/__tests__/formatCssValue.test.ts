import { formatCssValue } from '../formatCssValue';

describe('formatCssValue', () => {
  it('should append px to a numeric length', () => {
    expect(formatCssValue(10, 'width')).toBe('10px');
  });

  it('should keep a unitless numeric property unitless', () => {
    expect(formatCssValue(2, 'aspectRatio')).toBe('2');
  });

  it('should keep a vendor-prefixed unitless property unitless', () => {
    expect(formatCssValue(3, 'WebkitLineClamp')).toBe('3');
  });

  it('should never append px to a custom property', () => {
    expect(formatCssValue(4, '--gap')).toBe('4');
  });

  it('should keep zero unitless', () => {
    expect(formatCssValue(0, 'width')).toBe('0');
  });

  it('should stringify non-numeric values', () => {
    expect(formatCssValue('10px', 'width')).toBe('10px');
  });
});
