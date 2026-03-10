// @ts-nocheck
// Twenty core client internals — fully self-contained, no genql dependency.

export { generateGraphqlOperation } from './generate-graphql-operation';
export { createClient } from './create-client';
export { CoreGraphqlError } from './graphql-error';

export type { GraphqlOperation, ClientOptions } from './types';

// FieldsSelection is a no-op identity type in stub mode (no real type map).
// When genql codegen runs during app:dev, the generated index.ts replaces
// this entire file with real typed selections.
export type FieldsSelection<_TSource, _TFields> = _TSource;
