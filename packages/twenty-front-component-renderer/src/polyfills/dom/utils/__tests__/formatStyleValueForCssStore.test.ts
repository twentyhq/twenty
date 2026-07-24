import { formatStyleValueForCssStore } from '../formatStyleValueForCssStore';

describe('formatStyleValueForCssStore', () => {
  it('should append px to a numeric length when converting', () => {
    expect(formatStyleValueForCssStore(10, 'width', true)).toBe('10px');
  });

  it('should keep a unitless numeric property unitless when converting', () => {
    expect(formatStyleValueForCssStore(2, 'aspectRatio', true)).toBe('2');
  });

  it('should keep a vendor-prefixed unitless property unitless when converting', () => {
    expect(formatStyleValueForCssStore(3, 'WebkitLineClamp', true)).toBe('3');
  });

  it('should never append px to a custom property when converting', () => {
    expect(formatStyleValueForCssStore(4, '--gap', true)).toBe('4');
  });

  it('should keep zero unitless when converting', () => {
    expect(formatStyleValueForCssStore(0, 'width', true)).toBe('0');
  });

  it('should not append px when conversion is disabled', () => {
    expect(formatStyleValueForCssStore(10, 'width', false)).toBe('10');
  });

  it('should stringify non-numeric values', () => {
    expect(formatStyleValueForCssStore('10px', 'width', true)).toBe('10px');
  });
});
