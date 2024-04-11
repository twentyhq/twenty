import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { UNSYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/unsyncRemoteTable';
import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import {
  RemoteTableInput,
  UnsyncRemoteTableMutation,
  UnsyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';

export const useUnsyncRemoteTable = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { refetch: refetchObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [mutate] = useMutation<
    UnsyncRemoteTableMutation,
    UnsyncRemoteTableMutationVariables
  >(UNSYNC_REMOTE_TABLE, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const unsyncRemoteTable = useCallback(
    async (input: RemoteTableInput) => {
      const remoteTable = await mutate({
        variables: {
          input,
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_MANY_REMOTE_TABLES) ?? ''],
      });

      await refetchObjectMetadataItems();

      return remoteTable;
    },
    [mutate, refetchObjectMetadataItems],
  );

  return {
    unsyncRemoteTable,
  };
};
