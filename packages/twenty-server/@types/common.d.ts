type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer R>
    ? Array<DeepPartial<R>>
    : DeepPartial<T[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type ExcludeFunctions<T> = T extends Function ? never : T;

/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
type CircularDep<T> = T;
