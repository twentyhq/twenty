import { useQuery } from '@apollo/client';

import { GET_MANY_DATABASE_CONNECTIONS } from '@/databases/graphql/queries/findManyDatabaseConnections';
import {
  GetManyDatabaseConnectionsQuery,
  GetManyDatabaseConnectionsQueryVariables,
} from '~/generated-metadata/graphql';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';

type UseGetDatabaseConnectionsParams = {
  databaseKey: string;
  skip?: boolean;
};

export const useGetDatabaseConnections = ({
  databaseKey,
  skip,
}: UseGetDatabaseConnectionsParams) => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data } = useQuery<
    GetManyDatabaseConnectionsQuery,
    GetManyDatabaseConnectionsQueryVariables
  >(GET_MANY_DATABASE_CONNECTIONS, {
    client: apolloMetadataClient ?? undefined,
    skip: skip || !apolloMetadataClient || databaseKey !== 'postgresql',
    variables: {
      input: {
        foreignDataWrapperType: 'postgres_fdw',
      },
    },
  });

  return {
    connections: data?.findManyRemoteServersByType || [],
  };
};
