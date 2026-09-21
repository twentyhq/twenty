export const buildRecordFromKeysWithSameValue = <T, U extends string>(
  array: string[] | readonly U[],
  value: T,
): Record<U, T> =>
  Object.fromEntries(array.map((key) => [key, value])) as Record<U, T>;
