import { ApolloCache } from '@apollo/client';
import { Modifiers } from '@apollo/client/cache';

import { RemoteTable } from '~/generated-metadata/graphql';

export const modifyRemoteTableFromCache = ({
  cache,
  fieldModifiers,
  remoteTableName,
}: {
  cache: ApolloCache<object>;
  fieldModifiers: Modifiers<RemoteTable>;
  remoteTableName: string;
}) => {
  const remoteTableCacheId = `RemoteTable:{"name":"${remoteTableName}"}`;

  cache.modify({
    id: remoteTableCacheId,
    fields: fieldModifiers,
    optimistic: true,
  });
};
