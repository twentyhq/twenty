import { useQuery, type WatchQueryFetchPolicy } from '@apollo/client';

import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type GetManyRemoteTablesQuery,
  type GetManyRemoteTablesQueryVariables,
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
  const apolloMetadataClient = useApolloCoreClient();

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
