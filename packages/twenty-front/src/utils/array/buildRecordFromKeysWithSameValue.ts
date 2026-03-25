// const tmp =  ['foo', 'bar'] as const;
// const result = recordFromArrayWithValue(tmp, true);
// returns { foo: true, bar: true }
// result has strictly typed keys foo and bar

export const buildRecordFromKeysWithSameValue = <T, U extends string>(
  array: string[] | readonly U[],
  value: T,
): Record<U, T> =>
  Object.fromEntries(array.map((key) => [key, value])) as Record<U, T>;
