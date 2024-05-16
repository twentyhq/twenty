import { useLazyQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import {
  UseFindManyRecordsParams,
  useFindManyRecordsState,
} from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

type UseLazyFindManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
>;

export const useLazyFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  onCompleted,
  recordGqlFields,
  fetchPolicy,
}: UseLazyFindManyRecordsParams<T>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [findManyRecords, { data, loading, error, fetchMore }] =
    useLazyQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      variables: {
        filter,
        limit,
        orderBy,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: (data) => {
        if (!isDefined(data)) {
          onCompleted?.([]);
        }

        const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

        const records = getRecordsFromRecordConnection({
          recordConnection: data?.[objectMetadataItem.namePlural],
        }) as T[];

        onCompleted?.(records, {
          pageInfo,
          totalCount: data?.[objectMetadataItem.namePlural]?.totalCount,
        });

        if (isDefined(data?.[objectMetadataItem.namePlural])) {
          setLastCursor(pageInfo.endCursor ?? '');
          setHasNextPage(pageInfo.hasNextPage ?? false);
        }
      },
      onError: (error) => {
        logError(
          `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
            error,
        );
        enqueueSnackBar(
          `Error during useFindManyRecords for "${objectMetadataItem.namePlural}", ${error.message}`,
          {
            variant: 'error',
          },
        );
      },
    });

  const {
    findManyQueryStateIdentifier,
    setLastCursor,
    setHasNextPage,
    fetchMoreRecords,
    totalCount,
    records,
  } = useFindManyRecordsState<T>({
    objectNameSingular,
    filter,
    orderBy,
    limit,
    onCompleted,
    fetchMore,
    data,
    objectMetadataItem,
  });

  return {
    objectMetadataItem,
    records,
    totalCount,
    loading,
    error,
    fetchMoreRecords,
    queryStateIdentifier: findManyQueryStateIdentifier,
    findManyRecords: currentWorkspaceMember ? findManyRecords : () => {},
  };
};
