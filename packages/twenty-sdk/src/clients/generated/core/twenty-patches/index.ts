// @ts-nocheck
// Twenty patches barrel — re-exports the genql runtime with
// patched createClient and generateGraphqlOperation.

// Re-export everything from the unmodified genql runtime
export type { ClientOptions } from '../runtime/createClient';
export type { FieldsSelection } from '../runtime/typeSelection';
export type { GraphqlOperation } from '../runtime/generateGraphqlOperation';
export { linkTypeMap } from '../runtime/linkTypeMap';
export { createFetcher } from '../runtime/fetcher';
export { GenqlError } from '../runtime/error';
export const everything = {
  __scalar: true,
};

// Override with Twenty-patched versions
export { createClient } from './patched-create-client';
export { generateGraphqlOperation } from './patched-generate-graphql-operation';
