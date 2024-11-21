export type ObjectRecordDiff<T> = {
  [K in keyof T]: { before: T[K]; after: T[K] };
};
