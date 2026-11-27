import { type ApolloCache } from '@apollo/client';

import { invalidateCachedRelationsWithArguments } from '@/apollo/optimistic-effect/utils/invalidateCachedRelationsWithArguments';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { isPlainObject } from 'twenty-shared/utils';

export const invalidateCachedScopedRelations = ({
  cache,
  objectNameSingular,
  relationFieldNames,
}: {
  cache: ApolloCache;
  objectNameSingular: string;
  relationFieldNames: string[];
}) => {
  const normalizedCache = cache.extract();

  if (!isPlainObject(normalizedCache)) {
    return;
  }

  const recordCacheIdPrefix = `${getObjectTypename(objectNameSingular)}:`;

  cache.batch({
    update: () => {
      for (const recordCacheId of Object.keys(normalizedCache)) {
        if (!recordCacheId.startsWith(recordCacheIdPrefix)) {
          continue;
        }

        for (const relationFieldName of relationFieldNames) {
          invalidateCachedRelationsWithArguments({
            cache,
            recordCacheId,
            relationFieldName,
          });
        }
      }
    },
  });
};
