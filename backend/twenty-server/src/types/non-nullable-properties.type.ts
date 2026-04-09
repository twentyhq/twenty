export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
