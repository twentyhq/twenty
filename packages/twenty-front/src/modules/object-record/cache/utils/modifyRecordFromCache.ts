import { type ApolloCache, type Modifiers } from '@apollo/client/cache';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

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
