import { useQuery } from '@apollo/client';

import { GET_MANY_DATABASE_CONNECTIONS } from '@/databases/graphql/queries/findManyDatabaseConnections';
import {
  GetManyDatabaseConnectionsQuery,
  GetManyDatabaseConnectionsQueryVariables,
} from '~/generated-metadata/graphql';

type UseGetDatabaseConnectionsParams = {
  databaseKey: string;
  skip?: boolean;
};

export const useGetDatabaseConnections = ({
  databaseKey,
  skip,
}: UseGetDatabaseConnectionsParams) => {
  const { data } = useQuery<
    GetManyDatabaseConnectionsQuery,
    GetManyDatabaseConnectionsQueryVariables
  >(GET_MANY_DATABASE_CONNECTIONS, {
    skip: skip || databaseKey !== 'postgres',
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
