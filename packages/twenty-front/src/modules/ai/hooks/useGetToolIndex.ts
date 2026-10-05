import { useQuery } from '@apollo/client/react';

import {
  GetToolIndexDocument,
  type GetToolIndexQuery,
} from '~/generated-metadata/graphql';

const EMPTY_TOOL_INDEX: NonNullable<GetToolIndexQuery['getToolIndex']> = [];

export const useGetToolIndex = () => {
  const { data, loading, error } = useQuery(GetToolIndexDocument);

  return {
    toolIndex: data?.getToolIndex ?? EMPTY_TOOL_INDEX,
    loading,
    error,
  };
};
