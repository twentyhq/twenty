import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

// The tool index is read cache-first: dropping it refetches mounted readers
// once, and later readers fetch it on mount
export const useInvalidateToolIndex = () => {
  const client = useApolloClient();

  const invalidateToolIndex = useCallback(() => {
    client
      .refetchQueries({
        updateCache: (cache) => {
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'getToolIndex' });
        },
      })
      .catch(() => undefined);
  }, [client]);

  return { invalidateToolIndex };
};
