export function assertNotNull<T>(item: T): item is NonNullable<T> {
  return item !== null && item !== undefined;
}
