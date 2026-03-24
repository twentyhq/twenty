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

    await apolloCoreClient.refetchQueries({
      include: [findManyRecordsQueryName],
    });
  };

  return {
    refetchFindManyRecords,
  };
};
