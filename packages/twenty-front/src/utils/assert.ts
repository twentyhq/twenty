export const assertNotNull = <T>(item: T): item is NonNullable<T> =>
  item !== null && item !== undefined;
