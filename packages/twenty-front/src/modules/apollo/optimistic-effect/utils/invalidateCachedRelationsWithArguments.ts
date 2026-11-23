import { type ApolloCache, type StoreObject } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { isCachedRelationCopyWithArguments } from '@/apollo/optimistic-effect/utils/isCachedRelationCopyWithArguments';

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
        isCachedRelationCopyWithArguments({ storeFieldName, relationFieldName })
          ? DELETE
          : relationFieldValue,
    },
  });
};
