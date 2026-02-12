import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByAggregateQueryName } from '@/object-record/record-aggregate/utils/getGroupByAggregateQueryName';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';

export const useRefetchAggregateQueriesForObjectMetadataItem = () => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchAggregateQueriesForObjectMetadataItem = async ({
    objectMetadataItem,
  }: {
    objectMetadataItem: ObjectMetadataItem;
  }) => {
    const queryName = getAggregateQueryName(objectMetadataItem.namePlural);
    const groupByAggregateQueryName = getGroupByAggregateQueryName({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });
    await apolloCoreClient.refetchQueries({
      include: [queryName, groupByAggregateQueryName],
    });
  };

  return {
    refetchAggregateQueriesForObjectMetadataItem,
  };
};
