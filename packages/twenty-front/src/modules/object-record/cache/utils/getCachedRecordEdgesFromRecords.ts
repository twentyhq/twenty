import { ApolloClient, makeReference } from '@apollo/client';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { getCachedRecordFromRecord } from '@/object-record/cache/utils/getCachedRecordFromRecord';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getCachedRecordEdgesFromRecords = <T extends ObjectRecord>({
  apolloClient,
  objectNameSingular,
  records,
}: {
  apolloClient: ApolloClient<object>;
  objectNameSingular: string;
  records: T[];
}): CachedObjectRecordEdge[] => {
  const cachedRecordEdges = records.map((record) => {
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

    const reference = makeReference(id);

    const cachedObjectRecordEdge: CachedObjectRecordEdge = {
      cursor: '',
      node: reference,
      __typename: getEdgeTypename({ objectNameSingular }),
    };

    return cachedObjectRecordEdge;
  });

  return cachedRecordEdges;
};
