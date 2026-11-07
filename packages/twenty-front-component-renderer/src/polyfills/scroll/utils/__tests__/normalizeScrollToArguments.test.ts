import { normalizeScrollToArguments } from '@/polyfills/scroll/utils/normalizeScrollToArguments';

describe('normalizeScrollToArguments', () => {
  it('should map the two coordinate arguments to left and top', () => {
    expect(normalizeScrollToArguments([30, 120])).toEqual({
      left: 30,
      top: 120,
    });
  });

  it('should normalize both coordinate arguments', () => {
    expect(normalizeScrollToArguments(['15', Number.NaN])).toEqual({
      left: 15,
      top: 0,
    });
  });

  it('should return no offsets when called without arguments', () => {
    expect(normalizeScrollToArguments([])).toEqual({});
  });

  it('should return no offsets for an undefined or null options argument', () => {
    expect(normalizeScrollToArguments([undefined])).toEqual({});
    expect(normalizeScrollToArguments([null])).toEqual({});
  });

  it('should keep only the top axis when the options only define top', () => {
    expect(normalizeScrollToArguments([{ top: 80 }])).toEqual({ top: 80 });
  });

  it('should keep only the left axis when the options only define left', () => {
    expect(normalizeScrollToArguments([{ left: 64 }])).toEqual({ left: 64 });
  });

  it('should keep both axes when the options define top and left', () => {
    expect(
      normalizeScrollToArguments([{ top: 10, left: 20, behavior: 'smooth' }]),
    ).toEqual({ top: 10, left: 20 });
  });

  it('should normalize the option values', () => {
    expect(
      normalizeScrollToArguments([
        { top: '200', left: Number.POSITIVE_INFINITY },
      ]),
    ).toEqual({ top: 200, left: 0 });
  });

  it('should convert null option values to zero', () => {
    expect(normalizeScrollToArguments([{ top: null, left: null }])).toEqual({
      top: 0,
      left: 0,
    });
  });

  it('should treat a function argument as empty options', () => {
    expect(normalizeScrollToArguments([() => undefined])).toEqual({});
  });

  it('should throw a type error for a single primitive argument', () => {
    expect(() => normalizeScrollToArguments([5])).toThrow(TypeError);
    expect(() => normalizeScrollToArguments(['top'])).toThrow(TypeError);
    expect(() => normalizeScrollToArguments([true])).toThrow(TypeError);
  });
});
