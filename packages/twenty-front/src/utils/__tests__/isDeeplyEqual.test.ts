import deepEqual from 'deep-equal';
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

describe('isDeeplyEqual matches the deep-equal package', () => {
  const PRIMITIVES = [
    null,
    undefined,
    0,
    -0,
    1,
    '1',
    '',
    'a',
    true,
    false,
    Number.NaN,
  ];

  const createRandom = (seed: number) => {
    let state = seed;

    return () => {
      state = (state * 1103515245 + 12345) % 2147483648;

      return state / 2147483648;
    };
  };

  const generateValue = (random: () => number, depth: number): unknown => {
    const pick = random();

    if (depth > 3 || pick < 0.45) {
      return PRIMITIVES[Math.floor(random() * PRIMITIVES.length)];
    }

    if (pick < 0.7) {
      return Array.from({ length: Math.floor(random() * 3) }, () =>
        generateValue(random, depth + 1),
      );
    }

    if (pick < 0.75) {
      return new Date(Math.floor(random() * 3));
    }

    const keys = ['a', 'b', 'c', 'd'].filter(() => random() < 0.5);

    return Object.fromEntries(
      keys.map((key) => [key, generateValue(random, depth + 1)]),
    );
  };

  const mutate = (random: () => number, value: unknown): unknown => {
    if (random() < 0.2) {
      return generateValue(random, 2);
    }

    if (Array.isArray(value)) {
      return value.map((item) => mutate(random, item));
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      !(value instanceof Date)
    ) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, mutate(random, item)]),
      );
    }

    return value;
  };

  it.each([false, true])(
    'returns the same result for generated values (strict: %s)',
    (strict) => {
      const random = createRandom(strict ? 7 : 42);

      for (let index = 0; index < 5000; index++) {
        const a = generateValue(random, 0);
        const b = random() < 0.6 ? mutate(random, a) : generateValue(random, 0);

        expect(isDeeplyEqual(a, b, { strict })).toBe(
          deepEqual(a, b, { strict }),
        );
      }
    },
  );

  it('keeps loose equality between null and undefined values', () => {
    expect(isDeeplyEqual({ a: null }, { a: undefined })).toBe(true);
    expect(isDeeplyEqual({ a: null }, { a: undefined }, { strict: true })).toBe(
      false,
    );
  });
});
