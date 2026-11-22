import { type ApolloClient } from '@apollo/client';

export const invalidateToolIndex = (apolloClient: ApolloClient) =>
  apolloClient.refetchQueries({
    updateCache: (cache) => {
      cache.evict({ id: 'ROOT_QUERY', fieldName: 'getToolIndex' });
    },
  });
