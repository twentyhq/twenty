import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ApolloCache } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

// Makes a server created copy show up in lists and the record store without a refetch.
export const useAddDuplicatedRecordToCache = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const createOneRecordInCache = useCreateOneRecordInCache({
    objectMetadataItem,
  });

  const addDuplicatedRecordToCache = ({
    cache,
    record,
  }: {
    cache: ApolloCache;
    record: Pick<ObjectRecord, 'id'> & Record<string, unknown>;
  }) => {
    const createdRecord: ObjectRecord = {
      ...record,
      __typename: getObjectTypename(objectNameSingular),
    };

    createOneRecordInCache(createdRecord);
    // The optimistic effect only reaches the record store through relations,
    // and a duplicate response carries none.
    upsertRecordsInStore({ partialRecords: [createdRecord] });

    const recordNode = getRecordNodeFromRecord({
      objectMetadataItem,
      objectMetadataItems,
      record: createdRecord,
      computeReferences: false,
    });

    if (isDefined(recordNode)) {
      triggerCreateRecordsOptimisticEffect({
        cache,
        objectMetadataItem,
        recordsToCreate: [recordNode],
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
      });
    }
  };

  return { addDuplicatedRecordToCache };
};
