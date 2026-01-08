import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_TOOL_INDEX } from '@/ai/graphql/queries/getToolIndex';
import { useQuery } from '@apollo/client';

type ToolIndexEntry = {
  name: string;
  description: string;
  category: string;
  objectName?: string;
};

type GetToolIndexQuery = {
  getToolIndex: ToolIndexEntry[];
};

export const useGetToolIndex = () => {
  const apolloMetadataClient = useApolloCoreClient();

  const { data, loading, error } = useQuery<GetToolIndexQuery>(GET_TOOL_INDEX, {
    client: apolloMetadataClient ?? undefined,
  });

  return {
    toolIndex: data?.getToolIndex ?? [],
    loading,
    error,
  };
};
