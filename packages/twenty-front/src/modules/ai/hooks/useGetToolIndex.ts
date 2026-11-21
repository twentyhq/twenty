import { useQuery } from '@apollo/client/react';

import {
  GetToolIndexDocument,
  type GetToolIndexQuery,
} from '~/generated-metadata/graphql';

const EMPTY_TOOL_INDEX: NonNullable<GetToolIndexQuery['getToolIndex']> = [];

export const useGetToolIndex = ({
  skip = false,
  isRefreshedOnMount = false,
}: { skip?: boolean; isRefreshedOnMount?: boolean } = {}) => {
  // Chat step rows read it cache-first: refreshing on each mount would rebuild it server-side for every row
  const { data, loading, error } = useQuery(GetToolIndexDocument, {
    fetchPolicy: isRefreshedOnMount ? 'cache-and-network' : 'cache-first',
    skip,
  });

  return {
    toolIndex: data?.getToolIndex ?? EMPTY_TOOL_INDEX,
    loading,
    error,
  };
};
