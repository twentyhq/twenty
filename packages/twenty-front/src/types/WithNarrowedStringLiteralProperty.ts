export type WithNarrowedStringLiteralProperty<
  T,
  K extends keyof T,
  Sub extends T[K],
> = Omit<T, K> & {
  [P in K]: Extract<T[K], Sub>;
};
