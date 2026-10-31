import { describe, expect, it } from 'vitest';

import { isShallowEqual } from '../is-shallow-equal.util';

describe('isShallowEqual', () => {
  it('identifies identical primitives and references', () => {
    expect(isShallowEqual(1, 1)).toBe(true);
    expect(isShallowEqual('test', 'test')).toBe(true);
    expect(isShallowEqual(true, true)).toBe(true);
    expect(isShallowEqual(null, null)).toBe(true);
    expect(isShallowEqual(undefined, undefined)).toBe(true);
    expect(isShallowEqual(1, 2)).toBe(false);
    expect(isShallowEqual('a', 'b')).toBe(false);
  });

  it('identifies shallow equal objects with new references', () => {
    const objA = { recordId: '123', name: 'Acme' };
    const objB = { recordId: '123', name: 'Acme' };
    expect(isShallowEqual(objA, objB)).toBe(true);

    const objC = { recordId: '123', name: 'Acme Corp' };
    expect(isShallowEqual(objA, objC)).toBe(false);

    const objD = { recordId: '123' };
    expect(isShallowEqual(objA, objD)).toBe(false);
  });

  it('identifies shallow equal arrays with new references', () => {
    expect(isShallowEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(isShallowEqual(['a', 'b'], ['a', 'c'])).toBe(false);
    expect(isShallowEqual(['a', 'b'], ['a'])).toBe(false);
  });

  it('correctly handles null and non-object edge cases', () => {
    expect(isShallowEqual({ a: 1 }, null)).toBe(false);
    expect(isShallowEqual(null, { a: 1 })).toBe(false);
    expect(isShallowEqual({ a: 1 }, undefined)).toBe(false);
    expect(isShallowEqual({ a: 1 }, 'string')).toBe(false);
  });
});
