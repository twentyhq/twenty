import { useQuery } from '@apollo/client';

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
};

export const useGetDatabaseConnectionTables = ({
  connectionId,
  skip,
  shouldFetchPendingSchemaUpdates,
}: UseGetDatabaseConnectionTablesParams) => {
  const apolloMetadataClient = useApolloMetadataClient();

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
  });

  return {
    tables: data?.findDistantTablesWithStatus || [],
    error,
  };
};
