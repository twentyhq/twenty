import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WatchQueryFetchPolicy } from '@apollo/client';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ObjectRecordFilterInput, useSearchQuery } from '~/generated/graphql';
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

  const { enqueueErrorSnackBar } = useSnackBar();
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, previousData } = useSearchQuery({
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
    client: apolloCoreClient,
    onError: (error) => {
      logError(
        `useSearchRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
  });

  const effectiveData = loading ? previousData : data;

  const searchRecords = useMemo(
    () => effectiveData?.search.edges.map((edge) => edge.node) || [],
    [effectiveData],
  );

  return {
    objectMetadataItem,
    searchRecords,
    loading,
    error,
  };
};
