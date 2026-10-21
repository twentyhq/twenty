import { type ApolloCache, type Modifiers } from '@apollo/client/cache';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const modifyRecordFromCache = <
  CachedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectMetadataItem,
  cache,
  fieldModifiers,
  recordId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  cache: ApolloCache;
  fieldModifiers: Modifiers<CachedObjectRecord>;
  recordId: string;
}) => {
  if (!isDefined(objectMetadataItem)) return;

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: recordId,
  });

  cache.modify<CachedObjectRecord>({
    id: cachedRecordId,
    fields: fieldModifiers,
    optimistic: true,
  });
};
