import { isContextValueEqual } from '../isContextValueEqual';

describe('isContextValueEqual', () => {
  it('compares primitives', () => {
    expect(isContextValueEqual('dark', 'dark')).toBe(true);
    expect(isContextValueEqual(null, null)).toBe(true);
    expect(isContextValueEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(isContextValueEqual('dark', 'light')).toBe(false);
    expect(isContextValueEqual(null, undefined)).toBe(false);
    expect(isContextValueEqual(0, '0')).toBe(false);
  });

  it('compares nested objects and arrays structurally', () => {
    expect(
      isContextValueEqual(
        { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
        { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
      ),
    ).toBe(true);
    expect(isContextValueEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(isContextValueEqual({ id: 'a' }, { id: 'a', name: 'b' })).toBe(
      false,
    );
    expect(isContextValueEqual({ id: undefined }, { name: undefined })).toBe(
      false,
    );
    expect(isContextValueEqual([], {})).toBe(false);
    expect(isContextValueEqual({ id: 'a' }, null)).toBe(false);
  });
});
