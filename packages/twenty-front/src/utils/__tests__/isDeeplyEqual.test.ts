import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

describe('isDeeplyEqual', () => {
  it('should return true for equal primitives', () => {
    expect(isDeeplyEqual(1, 1)).toBe(true);
    expect(isDeeplyEqual('hello', 'hello')).toBe(true);
    expect(isDeeplyEqual(true, true)).toBe(true);
    expect(isDeeplyEqual(null, null)).toBe(true);
    expect(isDeeplyEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(isDeeplyEqual(1, 2)).toBe(false);
    expect(isDeeplyEqual('hello', 'world')).toBe(false);
    expect(isDeeplyEqual(true, false)).toBe(false);
  });

  it('should return true for deeply equal objects', () => {
    expect(isDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(
      true,
    );
  });

  it('should return false for different objects', () => {
    expect(isDeeplyEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isDeeplyEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it('should return true for deeply equal arrays', () => {
    expect(isDeeplyEqual([1, 2, [3]], [1, 2, [3]])).toBe(true);
  });

  it('should return false for different arrays', () => {
    expect(isDeeplyEqual([1, 2], [1, 3])).toBe(false);
    expect(isDeeplyEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});
