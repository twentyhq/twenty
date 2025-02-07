// const tmp =  ['foo', 'bar'] as const;
// const result = recordFromArrayWithValue(tmp, true);
// returns { foo: true, bar: true }
// result has strictly typed keys foo and bar

export const recordFromArrayWithValue = <T, U extends string>(
  array: string[] | readonly U[],
  value: T,
): Record<U, T> =>
  array.reduce(
    (acc, diffKey) => ({
      ...acc,
      [diffKey]: value,
    }),
    {},
  ) as Record<U, T>;
