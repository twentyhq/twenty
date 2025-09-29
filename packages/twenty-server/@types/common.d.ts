type ExcludeFunctions<T> = T extends Function ? never : T;

/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
type CircularDep<T> = T;
