import deepEqual from 'deep-equal';

type DeepEqualOptions = { strict: boolean };

const MAXIMUM_FAST_PATH_DEPTH = 64;

const objectToString = Object.prototype.toString;

const isPlainArray = (value: unknown): value is unknown[] =>
  Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    (prototype === Object.prototype || prototype === null) &&
    objectToString.call(value) === '[object Object]'
  );
};

const isEqual = (
  a: unknown,
  b: unknown,
  options: DeepEqualOptions | undefined,
  depth: number,
): boolean => {
  const isStrict = options?.strict === true;

  if (isStrict ? Object.is(a, b) : a === b) {
    return true;
  }

  const isAPrimitive =
    a === null || (typeof a !== 'object' && typeof a !== 'function');
  const isBPrimitive =
    b === null || (typeof b !== 'object' && typeof b !== 'function');

  if (isAPrimitive !== isBPrimitive) {
    return false;
  }

  if (isAPrimitive) {
    // oxlint-disable-next-line eqeqeq
    return isStrict ? Object.is(a, b) : a == b;
  }

  if (
    depth > MAXIMUM_FAST_PATH_DEPTH ||
    !(isPlainObject(a) || isPlainArray(a)) ||
    !(isPlainObject(b) || isPlainArray(b))
  ) {
    return deepEqual(a, b, options);
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (isStrict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
  }

  for (const key of aKeys) {
    if (
      !isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        options,
        depth + 1,
      )
    ) {
      return false;
    }
  }

  return true;
};

export const isDeeplyEqual = <T>(a: T, b: T, options?: DeepEqualOptions) =>
  isEqual(a, b, options, 0);
