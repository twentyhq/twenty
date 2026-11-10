import { isContextValueEqual } from '../isContextValueEqual';

const isEqual = (previousValue: unknown, nextValue: unknown) =>
  isContextValueEqual({ previousValue, nextValue });

describe('isContextValueEqual', () => {
  it('compares primitives', () => {
    expect(isEqual('dark', 'dark')).toBe(true);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(isEqual('dark', 'light')).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual(0, '0')).toBe(false);
  });

  it('compares nested objects and arrays structurally', () => {
    expect(
      isEqual(
        { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
        { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
      ),
    ).toBe(true);
    expect(isEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(isEqual({ id: 'a' }, { id: 'a', name: 'b' })).toBe(false);
    expect(isEqual({ id: undefined }, { name: undefined })).toBe(false);
    expect(isEqual([], {})).toBe(false);
    expect(isEqual({ id: 'a' }, null)).toBe(false);
  });

  it('treats distinct non-plain objects as changed', () => {
    expect(isEqual(new Set(['a']), new Set(['b']))).toBe(false);
    expect(isEqual(new Map(), new Map())).toBe(false);
    expect(isEqual(new Date(0), new Date(1))).toBe(false);
  });
});
