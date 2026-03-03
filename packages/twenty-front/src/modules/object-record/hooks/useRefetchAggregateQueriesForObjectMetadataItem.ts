import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useRefetchAggregateQueriesForObjectMetadataItem = () => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchAggregateQueriesForObjectMetadataItem = async ({
    objectMetadataItem,
  }: {
    objectMetadataItem: ObjectMetadataItem;
  }) => {
    await apolloCoreClient.refetchQueries({
      updateCache: (cache) => {
        cache.evict({ fieldName: objectMetadataItem.namePlural });
      },
    });
  };

  return {
    refetchAggregateQueriesForObjectMetadataItem,
  };
};
