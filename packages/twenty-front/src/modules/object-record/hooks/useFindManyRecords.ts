import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFindManyRecordsState } from '@/object-record/utils/useFindManyRecordsUtils';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

export type UseFindManyRecordsParams<T> = ObjectMetadataItemIdentifier &
  RecordGqlOperationVariables & {
    onCompleted?: (
      records: T[],
      options?: {
        pageInfo?: RecordGqlConnection['pageInfo'];
        totalCount?: number;
      },
    ) => void;
    onError?: (error?: Error) => void;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
  };

export const useFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  onCompleted,
  skip,
  recordGqlFields,
  fetchPolicy,
  onError,
}: UseFindManyRecordsParams<T>) => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { data, loading, error, fetchMore } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: skip || !objectMetadataItem || !currentWorkspaceMember,
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
            variant: SnackBarVariant.Error,
          },
        );
        onError?.(error);
      },
    });

  const {
    findManyQueryStateIdentifier,
    setLastCursor,
    setHasNextPage,
    fetchMoreRecords,
    totalCount,
    records,
    hasNextPage,
  } = useFindManyRecordsState<T>({
    objectNameSingular,
    filter,
    orderBy,
    limit,
    onCompleted,
    fetchMore,
    data,
    error,
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
    hasNextPage,
  };
};
