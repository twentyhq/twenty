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

  it('correctly compares Date instances by timestamp value', () => {
    const dateA = new Date('2026-01-01T00:00:00.000Z');
    const dateB = new Date('2026-01-01T00:00:00.000Z');
    const dateC = new Date('2026-02-01T00:00:00.000Z');

    expect(isShallowEqual(dateA, dateB)).toBe(true);
    expect(isShallowEqual(dateA, dateC)).toBe(false);
  });

  it('rejects non-plain objects such as Map and Set with distinct references', () => {
    const setA = new Set([1, 2]);
    const setB = new Set([1, 2]);
    expect(isShallowEqual(setA, setB)).toBe(false);

    const mapA = new Map([['key', 'val']]);
    const mapB = new Map([['key', 'val']]);
    expect(isShallowEqual(mapA, mapB)).toBe(false);

    class CustomModel {
      id = 1;
    }
    const instanceA = new CustomModel();
    const instanceB = new CustomModel();
    expect(isShallowEqual(instanceA, instanceB)).toBe(false);
  });

  it('correctly handles null and non-object edge cases', () => {
    expect(isShallowEqual({ a: 1 }, null)).toBe(false);
    expect(isShallowEqual(null, { a: 1 })).toBe(false);
    expect(isShallowEqual({ a: 1 }, undefined)).toBe(false);
    expect(isShallowEqual({ a: 1 }, 'string')).toBe(false);
  });
});
