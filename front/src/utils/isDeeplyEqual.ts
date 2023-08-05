import deepEqual from 'deep-equal';

export function isDeeplyEqual<T>(a: T, b: T) {
  return deepEqual(a, b);
}
