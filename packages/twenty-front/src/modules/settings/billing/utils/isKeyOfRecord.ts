export const isKeyOfRecord = <TKey extends string>(
  record: Record<TKey, unknown>,
  value: string,
): value is TKey => Object.prototype.hasOwnProperty.call(record, value);
