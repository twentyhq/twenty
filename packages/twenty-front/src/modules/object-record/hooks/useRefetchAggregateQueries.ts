import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useRefetchAggregateQueries = () => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchAggregateQueries = async ({
    objectMetadataNamePlural,
  }: {
    objectMetadataNamePlural: string;
  }) => {
    await apolloCoreClient.refetchQueries({
      updateCache: (cache) => {
        cache.evict({ fieldName: objectMetadataNamePlural });
      },
    });
  };

  return {
    refetchAggregateQueries,
  };
};
