import { type ApolloCache } from '@apollo/client';

import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const deleteRecordFromCache = ({
  objectMetadataItem,
  objectMetadataItems,
  recordToDestroy,
  cache,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordToDestroy: ObjectRecord;
  cache: ApolloCache<object>;
}) => {
  triggerDestroyRecordsOptimisticEffect({
    cache,
    objectMetadataItem,
    objectMetadataItems,
    recordsToDestroy: [
      {
        ...recordToDestroy,
        __typename: getObjectTypename(objectMetadataItem.nameSingular),
      },
    ],
  });
};
