// @ts-nocheck
// Creates a lightweight GraphQL client that uses convention-based
// type inference. No genql dependency.
import type { LinkedType, ClientOptions, GraphqlOperation } from './types';
import { CoreGraphqlError } from './graphql-error';
import { generateGraphqlOperation } from './generate-graphql-operation';

const createFetcher = (options: ClientOptions) => {
  const { fetcher: customFetcher } = options;

  if (!customFetcher) {
    throw new Error(
      'CoreApiClient requires a custom fetcher. ' +
        'Direct URL-based fetching is not supported in stub mode.',
    );
  }

  return async (operation: GraphqlOperation) => {
    const json = await customFetcher(operation);

    if (json?.errors?.length) {
      throw new CoreGraphqlError(json.errors, json.data);
    }

    return json.data;
  };
};

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
