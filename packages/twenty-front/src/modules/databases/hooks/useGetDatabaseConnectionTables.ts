import { useQuery } from '@apollo/client';

import { GET_MANY_DATABASE_CONNECTION_TABLES } from '@/databases/graphql/queries/findManyDatabaseConnectionTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  GetManyDatabaseConnectionTablesQuery,
  GetManyDatabaseConnectionTablesQueryVariables,
} from '~/generated-metadata/graphql';

type UseGetDatabaseConnectionTablesParams = {
  connectionId: string;
  skip?: boolean;
};

export const useGetDatabaseConnectionTables = ({
  connectionId,
  skip,
}: UseGetDatabaseConnectionTablesParams) => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data } = useQuery<
    GetManyDatabaseConnectionTablesQuery,
    GetManyDatabaseConnectionTablesQueryVariables
  >(GET_MANY_DATABASE_CONNECTION_TABLES, {
    client: apolloMetadataClient ?? undefined,
    skip: skip || !apolloMetadataClient,
    variables: {
      input: {
        id: connectionId,
      },
    },
  });

  return {
    tables: data?.findAvailableRemoteTablesByServerId || [],
  };
};
