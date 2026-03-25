import deepEqual from 'deep-equal';

export const isDeeplyEqual = <T>(a: T, b: T, options?: { strict: boolean }) =>
  deepEqual(a, b, options);
