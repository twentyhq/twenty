import { evaluateCssSupportsQuery } from '../evaluateCssSupportsQuery';

describe('evaluateCssSupportsQuery', () => {
  it('should support known property and value pairs', () => {
    expect(evaluateCssSupportsQuery(['display', 'flex'])).toBe(true);
    expect(evaluateCssSupportsQuery(['display', 'grid'])).toBe(true);
    expect(evaluateCssSupportsQuery(['position', 'sticky'])).toBe(true);
  });

  it('should normalize casing and whitespace', () => {
    expect(evaluateCssSupportsQuery([' DISPLAY ', ' Flex '])).toBe(true);
  });

  it('should support css-wide keywords on known properties only', () => {
    expect(evaluateCssSupportsQuery(['display', 'inherit'])).toBe(true);
    expect(evaluateCssSupportsQuery(['made-up-property', 'inherit'])).toBe(
      false,
    );
  });

  it('should return false for unknown properties and values', () => {
    expect(evaluateCssSupportsQuery(['made-up-property', 'flex'])).toBe(false);
    expect(evaluateCssSupportsQuery(['display', 'made-up-value'])).toBe(false);
    expect(evaluateCssSupportsQuery(['display', ''])).toBe(false);
  });

  it('should support any non-empty value on a custom property', () => {
    expect(evaluateCssSupportsQuery(['--custom-property', 'red'])).toBe(true);
    expect(evaluateCssSupportsQuery(['(--custom-property: 0 0 0)'])).toBe(true);
    expect(evaluateCssSupportsQuery(['--custom-property', ''])).toBe(false);
  });

  it('should not resolve property names through the object prototype', () => {
    expect(evaluateCssSupportsQuery(['toString', 'inherit'])).toBe(false);
    expect(evaluateCssSupportsQuery(['constructor', 'flex'])).toBe(false);
    expect(evaluateCssSupportsQuery(['__proto__', 'inherit'])).toBe(false);
    expect(evaluateCssSupportsQuery(['valueOf', 'initial'])).toBe(false);
  });

  it('should not report support for values no browser implements', () => {
    expect(evaluateCssSupportsQuery(['user-select', 'contain'])).toBe(false);
    expect(evaluateCssSupportsQuery(['overflow-anchor', 'none'])).toBe(false);
  });

  it('should evaluate single-argument declaration conditions', () => {
    expect(evaluateCssSupportsQuery(['(display: grid)'])).toBe(true);
    expect(evaluateCssSupportsQuery(['display: flex'])).toBe(true);
    expect(evaluateCssSupportsQuery(['(display: made-up-value)'])).toBe(false);
  });

  it('should accept an important priority in condition form only, like the native api', () => {
    expect(evaluateCssSupportsQuery(['display: flex !important'])).toBe(true);
    expect(evaluateCssSupportsQuery(['display', 'flex !important'])).toBe(
      false,
    );
  });

  it('should return false for complex conditions instead of evaluating them', () => {
    expect(
      evaluateCssSupportsQuery(['(display: grid) and (position: sticky)']),
    ).toBe(false);
    expect(evaluateCssSupportsQuery(['not (display: grid)'])).toBe(false);
    expect(
      evaluateCssSupportsQuery(['(display: grid) or (display: flex)']),
    ).toBe(false);
    expect(evaluateCssSupportsQuery(['selector(a > b)'])).toBe(false);
  });

  it('should return false for malformed input without throwing', () => {
    expect(evaluateCssSupportsQuery([])).toBe(false);
    expect(evaluateCssSupportsQuery([''])).toBe(false);
    expect(evaluateCssSupportsQuery(['((('])).toBe(false);
    expect(evaluateCssSupportsQuery(['display'])).toBe(false);
    expect(evaluateCssSupportsQuery(['()'])).toBe(false);
    expect(evaluateCssSupportsQuery([undefined])).toBe(false);
    expect(evaluateCssSupportsQuery([null, null])).toBe(false);
  });
});
