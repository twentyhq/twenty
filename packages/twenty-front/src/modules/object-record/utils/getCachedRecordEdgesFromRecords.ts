import { makeReference, useApolloClient } from '@apollo/client';

import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useGetCachedRecordEdgesFromRecords = <T extends ObjectRecord>({
  objectNameSingular,
  records,
}: {
  objectNameSingular: string;
  records: T[];
}): CachedObjectRecordEdge<T>[] => {
  const apolloClient = useApolloClient();

  const cachedObjectRecords = records.map((record) => ({
    __typename: capitalize(objectNameSingular),
    ...record,
  })) as CachedObjectRecord<T>[];

  const objectRecordsAsReferences = cachedObjectRecords.map((record) => {
    const id = apolloClient.cache.identify(record);

    if (!id) {
      throw new Error(
        `Could not identify record "${objectNameSingular}", id : "${record.id}"`,
      );
    }

    return makeReference(id);
  });

  const cachedRecordEdges = objectRecordsAsReferences.map(
    (objectRecordAsReference) =>
      ({
        __typename: `${capitalize(objectNameSingular)}Edge`,
        cursor: '',
        node: objectRecordAsReference,
      }) as CachedObjectRecordEdge<T>,
  );

  return cachedRecordEdges;
};
