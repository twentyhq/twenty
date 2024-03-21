import { useQuery } from '@apollo/client';

import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
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
  const mapConnectionToRecords = useMapConnectionToRecords();

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
      mapConnectionToRecords({
        objectRecordConnection: objectRecordConnection,
        depth: 5,
        objectNamePlural: namePlural,
      }),
    ]),
  );

  return {
    result: resultWithoutConnection,
  };
};
