export type KeyOfCompositeField<T> = keyof Omit<T, '__typename'> extends string
  ? keyof Omit<T, '__typename'>
  : never;
