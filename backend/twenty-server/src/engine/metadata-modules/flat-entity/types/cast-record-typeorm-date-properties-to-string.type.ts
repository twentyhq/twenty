export type CastRecordTypeOrmDatePropertiesToString<T> = {
  [P in keyof T as [T[P]] extends [never]
    ? never
    : [NonNullable<T[P]>] extends [never]
      ? never
      : NonNullable<T[P]> extends Date
        ? P
        : never]: null extends T[P] ? string | null : string;
};
