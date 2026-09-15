import { GET_TOOL_INDEX } from '@/ai/graphql/queries/getToolIndex';
import { useQuery } from '@apollo/client/react';

import { type GetToolIndexQuery } from '~/generated-metadata/graphql';

const EMPTY_TOOL_INDEX: NonNullable<GetToolIndexQuery['getToolIndex']> = [];

export const useGetToolIndex = () => {
  const { data, loading, error } = useQuery<GetToolIndexQuery>(GET_TOOL_INDEX);

  return {
    toolIndex: data?.getToolIndex ?? EMPTY_TOOL_INDEX,
    loading,
    error,
  };
};
