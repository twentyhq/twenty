import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';

export const useRefetchAggregateQueries = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchAggregateQueries = async () => {
    const queryName = getAggregateQueryName(objectMetadataNamePlural);

    await apolloCoreClient.refetchQueries({
      include: [queryName],
    });
  };

  return {
    refetchAggregateQueries,
  };
};
