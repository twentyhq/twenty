export type ExcludeLiteral<T, U extends T> = T extends U ? never : T;
