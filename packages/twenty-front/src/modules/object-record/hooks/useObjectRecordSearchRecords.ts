import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WatchQueryFetchPolicy } from '@apollo/client';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  ObjectRecordFilterInput,
  useGlobalSearchQuery,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

export type UseSearchRecordsParams = ObjectMetadataItemIdentifier & {
  limit?: number;
  onError?: (error?: Error) => void;
  skip?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
  searchInput?: string;
  filter?: ObjectRecordFilterInput;
};

export const useObjectRecordSearchRecords = ({
  objectNameSingular,
  searchInput,
  limit,
  skip,
  filter,
  fetchPolicy,
}: UseSearchRecordsParams) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error, previousData } = useGlobalSearchQuery({
    skip:
      skip ||
      !objectMetadataItem ||
      !currentWorkspaceMember ||
      !isDefined(searchInput),
    variables: {
      searchInput: searchInput ?? '',
      limit: limit ?? MAX_SEARCH_RESULTS,
      filter: filter ?? {},
      includedObjectNameSingulars: [objectNameSingular],
    },
    fetchPolicy: fetchPolicy,
    onError: (error) => {
      logError(
        `useGlobalSearchRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueSnackBar(
        `Error during useGlobalSearchRecords for "${objectMetadataItem.namePlural}", ${error.message}`,
        {
          variant: SnackBarVariant.Error,
        },
      );
    },
  });

  const effectiveData = loading ? previousData : data;

  const searchRecords = useMemo(
    () => effectiveData?.globalSearch || [],
    [effectiveData],
  );

  return {
    objectMetadataItem,
    searchRecords,
    loading,
    error,
  };
};
