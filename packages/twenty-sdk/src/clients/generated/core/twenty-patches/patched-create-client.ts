// @ts-nocheck
// Twenty patch over @genql/runtime's createClient.
// Wraps generateGraphqlOperation calls in try/catch so synchronous
// throws from convention-based inference are returned as rejected promises.
import { createFetcher } from '../runtime/fetcher';
import type { LinkedType } from '../runtime/types';
import type { ClientOptions } from '../runtime/createClient';
import { generateGraphqlOperation } from './patched-generate-graphql-operation';

export const createClient = ({
  queryRoot,
  mutationRoot,
  subscriptionRoot,
  ...options
}: ClientOptions & {
  queryRoot?: LinkedType;
  mutationRoot?: LinkedType;
  subscriptionRoot?: LinkedType;
}) => {
  const fetcher = createFetcher(options);
  const client: {
    query?: Function;
    mutation?: Function;
  } = {};

  if (queryRoot) {
    client.query = (request: any) => {
      if (!queryRoot) throw new Error('queryRoot argument is missing');

      try {
        return fetcher(
          generateGraphqlOperation('query', queryRoot, request),
        );
      } catch (error) {
        return Promise.reject(error);
      }
    };
  }
  if (mutationRoot) {
    client.mutation = (request: any) => {
      if (!mutationRoot)
        throw new Error('mutationRoot argument is missing');

      try {
        return fetcher(
          generateGraphqlOperation('mutation', mutationRoot, request),
        );
      } catch (error) {
        return Promise.reject(error);
      }
    };
  }

  return client as any;
};
