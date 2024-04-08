import { useQuery } from '@apollo/client';

import { GET_MANY_DATABASE_CONNECTIONS } from '@/databases/graphql/queries/findManyDatabaseConnections';
import { getForeignDataWrapperType } from '@/databases/utils/getForeignDataWrapperType';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
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
  const apolloMetadataClient = useApolloMetadataClient();
  const foreignDataWrapperType = getForeignDataWrapperType(databaseKey);

  const { data } = useQuery<
    GetManyDatabaseConnectionsQuery,
    GetManyDatabaseConnectionsQueryVariables
  >(GET_MANY_DATABASE_CONNECTIONS, {
    client: apolloMetadataClient ?? undefined,
    skip: skip || !apolloMetadataClient || !foreignDataWrapperType,
    variables: {
      input: {
        foreignDataWrapperType: foreignDataWrapperType || '',
      },
    },
  });

  return {
    connections: data?.findManyRemoteServersByType || [],
  };
};
