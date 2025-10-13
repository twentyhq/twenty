import { useLazyQuery } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';

import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseLazyFindManyRecordsWithOffsetParams = Pick<
  UseFindManyRecordsParams<ObjectRecord>,
  'objectNameSingular'
>;

export const useLazyFindManyRecordsWithOffset = ({
  objectNameSingular,
}: UseLazyFindManyRecordsWithOffsetParams) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const [findManyRecords] = useLazyQuery<RecordGqlOperationFindManyResult>(
    findManyRecordsQuery,
    {
      variables: {
        ...params,
      },
      onError: handleFindManyRecordsError,
      client: apolloCoreClient,
    },
  );

  const findManyRecordsLazyWithOffset = useRecoilCallback(
    () => async (limit: number, offset: number) => {
      if (!hasReadPermission) {
        return {
          data: null,
          records: null,
          totalCount: 0,
          error: undefined,
        };
      }

      const result = await findManyRecords({
        variables: {
          limit,
          offset,
        },
      });

      const records = getRecordsFromRecordConnection({
        recordConnection: {
          edges: result?.data?.[objectMetadataItem.namePlural]?.edges ?? [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '',
            endCursor: '',
          },
        },
      });

      return {
        data: result?.data,
        records,
        error: result?.error,
      };
    },
    [hasReadPermission, findManyRecords, objectMetadataItem.namePlural],
  );

  return {
    findManyRecordsLazyWithOffset,
  };
};
