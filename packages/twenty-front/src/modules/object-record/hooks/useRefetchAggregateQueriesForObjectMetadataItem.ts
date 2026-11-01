import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';

export const useRefetchAggregateQueriesForObjectMetadataItem = () => {
  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  const refetchAggregateQueriesForObjectMetadataItem = async ({
    objectMetadataItem,
  }: {
    objectMetadataItem: EnrichedObjectMetadataItem;
  }) => {
    await refetchAggregateQueries({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });
  };

  return {
    refetchAggregateQueriesForObjectMetadataItem,
  };
};
