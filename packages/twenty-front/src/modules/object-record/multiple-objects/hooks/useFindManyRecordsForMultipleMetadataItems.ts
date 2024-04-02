import { useQuery } from '@apollo/client';

import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/multiple-objects/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';

export const useFindManyRecordsForMultipleMetadataItems = ({
  objectMetadataItems,
  skip = false,
  depth = 2,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  skip: boolean;
  depth?: number;
}) => {
  const findManyQuery = useGenerateFindManyRecordsForMultipleMetadataItemsQuery(
    {
      targetObjectMetadataItems: objectMetadataItems,
      depth,
    },
  );

  const { data } = useQuery<MultiObjectRecordQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    {
      skip,
    },
  );

  const resultWithoutConnection = Object.fromEntries(
    Object.entries(data ?? {}).map(([namePlural, objectRecordConnection]) => [
      namePlural,
      getRecordsFromRecordConnection({
        recordConnection: objectRecordConnection,
      }),
    ]),
  );

  return {
    result: resultWithoutConnection,
  };
};
