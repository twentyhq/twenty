import { ApolloCache, Modifiers } from '@apollo/client/cache';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const modifyRecordFromCache = <
  CachedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectMetadataItem,
  cache,
  fieldModifiers,
  recordId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<object>;
  fieldModifiers: Modifiers<CachedObjectRecord>;
  recordId: string;
}) => {
  if (isUndefinedOrNull(objectMetadataItem)) return;

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
