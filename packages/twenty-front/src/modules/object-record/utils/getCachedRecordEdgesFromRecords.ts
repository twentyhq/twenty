import { makeReference, useApolloClient } from '@apollo/client';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getCachedRecordFromRecord } from '@/object-record/utils/getCachedRecordFromRecord';
import { getEdgeTypename } from '@/object-record/utils/getEdgeTypename';

export const useGetCachedRecordEdgesFromRecords = <T extends ObjectRecord>({
  objectNameSingular,
  records,
}: {
  objectNameSingular: string;
  records: T[];
}): CachedObjectRecordEdge[] => {
  const apolloClient = useApolloClient();

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
