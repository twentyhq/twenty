import { useQuery } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';

export const useCombinedGetTotalCount = ({
  objectMetadataItems,
  skip = false,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  skip?: boolean;
}) => {
  const operationSignatures = objectMetadataItems.map(
    (objectMetadataItem) =>
      ({
        objectNameSingular: objectMetadataItem.nameSingular,
        variables: {},
        fields: {
          id: true,
        },
      }) satisfies RecordGqlOperationSignature,
  );

  const findManyQuery = useGenerateCombinedFindManyRecordsQuery({
    operationSignatures,
  });

  const { data } = useQuery<CombinedFindManyRecordsQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    {
      skip,
    },
  );

  const totalCountByObjectMetadataItemNamePlural = Object.fromEntries(
    Object.entries(data ?? {}).map(([namePlural, objectRecordConnection]) => [
      namePlural,
      objectRecordConnection.totalCount,
    ]),
  );

  return {
    totalCountByObjectMetadataItemNamePlural,
  };
};
