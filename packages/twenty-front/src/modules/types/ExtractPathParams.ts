export type ExtractPathParams<V extends string> =
  V extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : V extends `${string}:${infer Param}`
      ? Param
      : never;
