import { useQuery } from '@apollo/client';

import { GET_ONE_DATABASE_CONNECTION } from '@/databases/graphql/queries/findOneDatabaseConnection';
import { getForeignDataWrapperType } from '@/databases/utils/getForeignDataWrapperType';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  GetOneDatabaseConnectionQuery,
  GetOneDatabaseConnectionQueryVariables,
} from '~/generated-metadata/graphql';

type UseGetDatabaseConnectionParams = {
  databaseKey: string;
  connectionId: string;
  skip?: boolean;
};

export const useGetDatabaseConnection = ({
  databaseKey,
  connectionId,
  skip,
}: UseGetDatabaseConnectionParams) => {
  const apolloMetadataClient = useApolloMetadataClient();
  const foreignDataWrapperType = getForeignDataWrapperType(databaseKey);

  const { data, loading } = useQuery<
    GetOneDatabaseConnectionQuery,
    GetOneDatabaseConnectionQueryVariables
  >(GET_ONE_DATABASE_CONNECTION, {
    client: apolloMetadataClient ?? undefined,
    skip: skip || !apolloMetadataClient || !foreignDataWrapperType,
    variables: {
      input: {
        id: connectionId,
      },
    },
  });

  const connection = data?.findOneRemoteServerById ?? null;

  return {
    connection:
      connection?.foreignDataWrapperType === foreignDataWrapperType
        ? connection
        : null,
    loading,
  };
};
