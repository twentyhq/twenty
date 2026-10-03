// Apps write enum fields as plain strings, often without importing the enum
export type LooseEnumValues<T> = T extends string
  ? T | `${T}`
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]: LooseEnumValues<T[K]> }
      : T;
