import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { capitalize } from 'twenty-shared/utils';

export const useRefetchFindManyRecords = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchFindManyRecords = async () => {
    const findManyRecordsQueryName = `FindMany${capitalize(
      objectMetadataNamePlural,
    )}`;

    // Including by name would also re-run skipped queries
    await apolloCoreClient.refetchQueries({
      include: 'active',
      onQueryUpdated: (observableQuery) =>
        observableQuery.queryName === findManyRecordsQueryName,
    });
  };

  return {
    refetchFindManyRecords,
  };
};
