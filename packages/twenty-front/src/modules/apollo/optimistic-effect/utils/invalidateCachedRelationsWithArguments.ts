import { type ApolloCache, type StoreObject } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

// Only the server applies a relation's filter, sort and limit, so its copies with arguments are dropped for the next read to refetch them
export const invalidateCachedRelationsWithArguments = ({
  cache,
  recordCacheId,
  relationFieldName,
}: {
  cache: ApolloCache;
  recordCacheId: string | undefined;
  relationFieldName: string;
}) => {
  // Without an id, cache.modify would fall back to the root query and drop its lists
  if (!isDefined(recordCacheId)) {
    return;
  }

  cache.modify<StoreObject>({
    id: recordCacheId,
    fields: {
      [relationFieldName]: (relationFieldValue, { storeFieldName, DELETE }) =>
        storeFieldName === relationFieldName ? relationFieldValue : DELETE,
    },
  });
};
