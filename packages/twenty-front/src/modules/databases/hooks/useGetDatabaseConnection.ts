import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';

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
  fetchPolicy?: WatchQueryFetchPolicy;
};

export const useGetDatabaseConnection = ({
  databaseKey,
  connectionId,
  skip,
  fetchPolicy,
}: UseGetDatabaseConnectionParams) => {
  const apolloMetadataClient = useApolloMetadataClient();
  const foreignDataWrapperType = getForeignDataWrapperType(databaseKey);

  const fetchPolicyOption = fetchPolicy ? { fetchPolicy: fetchPolicy } : {};

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
    ...fetchPolicyOption,
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
