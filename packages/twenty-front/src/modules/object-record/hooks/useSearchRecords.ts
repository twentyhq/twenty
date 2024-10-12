import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationSearchResult } from '@/object-record/graphql/types/RecordGqlOperationSearchResult';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useSearchRecordsQuery } from '@/object-record/hooks/useSearchRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';
import { logError } from '~/utils/logError';

export type UseSearchRecordsParams<T> = ObjectMetadataItemIdentifier &
  RecordGqlOperationVariables & {
    onError?: (error?: Error) => void;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
    searchInput?: string;
    onCompleted?: (data: T[]) => void;
  };

export const useSearchRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  searchInput,
  limit,
  skip,
  recordGqlFields,
  fetchPolicy,
  onCompleted,
}: UseSearchRecordsParams<T>) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { searchRecordsQuery } = useSearchRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { enqueueSnackBar } = useSnackBar();
  const handleFindManyRecordsCompleted = (
    data: RecordGqlOperationFindManyResult,
  ) => {
    if (!isDefined(data)) {
      onCompleted?.([]);
    }

    const records = getRecordsFromRecordConnection({
      recordConnection: data?.[objectMetadataItem.namePlural],
    }) as T[];

    onCompleted?.(records);
  };
  const { data, loading, error } = useQuery<RecordGqlOperationSearchResult>(
    searchRecordsQuery,
    {
      skip:
        skip || !objectMetadataItem || !currentWorkspaceMember || !searchInput,
      variables: {
        search: searchInput,
        limit: limit,
      },
      fetchPolicy: fetchPolicy,
      onError: (error) => {
        logError(
          `useSearchRecords for "${objectMetadataItem.namePlural}" error : ` +
            error,
        );
        enqueueSnackBar(
          `Error during useSearchRecords for "${objectMetadataItem.namePlural}", ${error.message}`,
          {
            variant: SnackBarVariant.Error,
          },
        );
      },
      onCompleted: handleFindManyRecordsCompleted,
    },
  );

  const queryResponseField = getSearchRecordsQueryResponseField(
    objectMetadataItem.namePlural,
  );

  const result = data?.[queryResponseField];

  const records = useMemo(
    () =>
      result
        ? (getRecordsFromRecordConnection({
            recordConnection: result,
          }) as T[])
        : [],
    [result],
  );

  return {
    objectMetadataItem,
    records: records,
    loading,
    error,
  };
};
