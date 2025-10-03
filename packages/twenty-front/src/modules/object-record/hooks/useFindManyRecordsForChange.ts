import { useQuery } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useRecordFieldGqlFields } from '@/object-record/record-field/hooks/useRecordTableRecordGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseLazyFindManyRecordsWithOffsetParams = Pick<
  UseFindManyRecordsParams<ObjectRecord>,
  'objectNameSingular'
>;

export const useFindManyRecordsForChange = ({
  objectNameSingular,
}: UseLazyFindManyRecordsWithOffsetParams) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordFieldGqlFields({ objectMetadataItem });

  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  const { observable } = useQuery<RecordGqlOperationFindManyResult>(
    findManyRecordsQuery,
    {
      variables: {
        ...params,
        first: 1,
        last: 1,
        limit: 1,
      },
      onError: handleFindManyRecordsError,
      client: apolloCoreClient,
    },
  );

  return { observable };
};
