import { useQuery } from '@apollo/client/react';

import {
  GetToolIndexDocument,
  type GetToolIndexQuery,
} from '~/generated-metadata/graphql';

const EMPTY_TOOL_INDEX: NonNullable<GetToolIndexQuery['getToolIndex']> = [];

export const useGetToolIndex = ({ skip = false }: { skip?: boolean } = {}) => {
  // cache-and-network would rebuild the index server-side for every chat step row
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
