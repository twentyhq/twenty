import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';

import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  GetManyRemoteTablesQuery,
  GetManyRemoteTablesQueryVariables,
} from '~/generated-metadata/graphql';

type UseGetDatabaseConnectionTablesParams = {
  connectionId: string;
  skip?: boolean;
  shouldFetchPendingSchemaUpdates?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
};

export const useGetDatabaseConnectionTables = ({
  connectionId,
  skip,
  shouldFetchPendingSchemaUpdates,
  fetchPolicy,
}: UseGetDatabaseConnectionTablesParams) => {
  const apolloMetadataClient = useApolloMetadataClient();

  const fetchPolicyOption = fetchPolicy ? { fetchPolicy: fetchPolicy } : {};

  const { data, error } = useQuery<
    GetManyRemoteTablesQuery,
    GetManyRemoteTablesQueryVariables
  >(GET_MANY_REMOTE_TABLES, {
    client: apolloMetadataClient ?? undefined,
    skip: skip || !apolloMetadataClient,
    variables: {
      input: {
        id: connectionId,
        shouldFetchPendingSchemaUpdates,
      },
    },
    ...fetchPolicyOption,
  });

  return {
    tables: data?.findDistantTablesWithStatus || [],
    error,
  };
};
