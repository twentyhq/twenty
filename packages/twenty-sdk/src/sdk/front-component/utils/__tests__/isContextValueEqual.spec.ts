import { isContextValueEqual } from '../isContextValueEqual';

describe('isContextValueEqual', () => {
  it.each([
    ['dark', 'dark'],
    [null, null],
    [Number.NaN, Number.NaN],
    [
      { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
      { ids: ['a', 'b'], filter: { id: { in: ['a', 'b'] } } },
    ],
  ])('treats %j and %j as equal', (previousValue, nextValue) => {
    expect(isContextValueEqual({ previousValue, nextValue })).toBe(true);
  });

  it.each([
    ['dark', 'light'],
    [null, undefined],
    [0, '0'],
    [
      ['a', 'b'],
      ['b', 'a'],
    ],
    [{ id: 'a' }, { id: 'a', name: 'b' }],
    [{ id: undefined }, { name: undefined }],
    [[], {}],
    [{ id: 'a' }, null],
    [new Set(['a']), new Set(['b'])],
    [new Map(), new Map()],
    [new Date(0), new Date(1)],
  ])('treats %j and %j as different', (previousValue, nextValue) => {
    expect(isContextValueEqual({ previousValue, nextValue })).toBe(false);
  });
});
