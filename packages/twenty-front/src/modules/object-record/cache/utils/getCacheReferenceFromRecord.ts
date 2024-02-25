import { ApolloClient, makeReference, Reference } from '@apollo/client';

import { getCachedRecordFromRecord } from '@/object-record/cache/utils/getCachedRecordFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getCacheReferenceFromRecord = <T extends ObjectRecord>({
  apolloClient,
  objectNameSingular,
  record,
}: {
  apolloClient: ApolloClient<object>;
  objectNameSingular: string;
  record: T;
}): Reference => {
  const cachedRecord = getCachedRecordFromRecord({
    objectNameSingular,
    record,
  });

  const id = apolloClient.cache.identify(cachedRecord);

  if (!id) {
    throw new Error(
      `Could not identify record "${objectNameSingular}", id : "${record.id}"`,
    );
  }

  const recordReference = makeReference(id);

  return recordReference;
};
