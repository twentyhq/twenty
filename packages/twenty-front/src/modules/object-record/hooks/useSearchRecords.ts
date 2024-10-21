import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationSearchResult } from '@/object-record/graphql/types/RecordGqlOperationSearchResult';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useSearchRecordsQuery } from '@/object-record/hooks/useSearchRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

export type UseSearchRecordsParams = ObjectMetadataItemIdentifier &
  Pick<RecordGqlOperationVariables, 'filter' | 'limit'> & {
    onError?: (error?: Error) => void;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
    searchInput?: string;
  };

export const useSearchRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  searchInput,
  limit,
  skip,
  filter,
  recordGqlFields,
  fetchPolicy,
}: UseSearchRecordsParams) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { searchRecordsQuery } = useSearchRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { enqueueSnackBar } = useSnackBar();
  const { data, loading, error, previousData } =
    useQuery<RecordGqlOperationSearchResult>(searchRecordsQuery, {
      skip:
        skip ||
        !objectMetadataItem ||
        !currentWorkspaceMember ||
        !isDefined(searchInput),
      variables: {
        search: searchInput,
        limit: limit,
        filter: filter,
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
    });

  const effectiveData = loading ? previousData : data;

  const queryResponseField = getSearchRecordsQueryResponseField(
    objectMetadataItem.namePlural,
  );

  const result = effectiveData?.[queryResponseField];

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
