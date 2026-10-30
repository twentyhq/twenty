import { useQuery } from '@apollo/client/react';

import {
  GetToolIndexDocument,
  type GetToolIndexQuery,
} from '~/generated-metadata/graphql';

const EMPTY_TOOL_INDEX: NonNullable<GetToolIndexQuery['getToolIndex']> = [];

export const useGetToolIndex = ({ skip = false }: { skip?: boolean } = {}) => {
  // The metadata client defaults to cache-and-network, which would rebuild the
  // whole index server-side each time a chat step row mounts; freshness comes
  // from AgentChatToolIndexInvalidationEffect instead
  const { data, loading, error } = useQuery(GetToolIndexDocument, {
    fetchPolicy: 'cache-first',
    skip,
  });

  return {
    toolIndex: data?.getToolIndex ?? EMPTY_TOOL_INDEX,
    loading,
    error,
  };
};
