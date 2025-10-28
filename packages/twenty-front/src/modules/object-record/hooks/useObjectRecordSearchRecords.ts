import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useDoObjectMetadataItemsExist } from '@/object-metadata/hooks/useDoObjectMetadataItemsExist';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type WatchQueryFetchPolicy } from '@apollo/client';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  type ObjectRecordFilterInput,
  type SearchQuery,
  useSearchQuery,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

// maybe we should look at ObjectMetadataItemIdentifier to update the API even though there are many location to update
export type UseSearchRecordsParams = {
  objectNameSingulars: string[];
  limit?: number;
  onError?: (error?: Error) => void;
  onCompleted?: (data: SearchQuery) => void;
  skip?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
  searchInput?: string;
  filter?: ObjectRecordFilterInput;
};

export const useObjectRecordSearchRecords = ({
  objectNameSingulars,
  searchInput,
  limit,
  onCompleted,
  skip,
  filter,
  fetchPolicy,
}: UseSearchRecordsParams) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const areDefined = useDoObjectMetadataItemsExist(objectNameSingulars);

  const { enqueueErrorSnackBar } = useSnackBar();
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, previousData } = useSearchQuery({
    skip:
      skip || !areDefined || !currentWorkspaceMember || !isDefined(searchInput),
    variables: {
      searchInput: searchInput ?? '',
      limit: limit ?? MAX_SEARCH_RESULTS,
      filter: filter ?? {},
      includedObjectNameSingulars: objectNameSingulars,
    },
    fetchPolicy: fetchPolicy,
    client: apolloCoreClient,
    onCompleted: onCompleted,
    onError: (error) => {
      logError(
        `useSearchRecords for "${objectNameSingulars.join(', ')}" error : ` +
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
    searchRecords,
    loading,
    error,
  };
};
