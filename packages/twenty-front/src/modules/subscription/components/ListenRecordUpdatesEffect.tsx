import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { DatabaseEventAction } from '~/generated/graphql';

type ListenRecordUpdatesEffectProps = {
  objectNameSingular: string;
  recordId: string;
  listenedFields: string[];
};

export const ListenRecordUpdatesEffect = ({
  objectNameSingular,
  recordId,
  listenedFields,
}: ListenRecordUpdatesEffectProps) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { recordGqlFields: computedRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      depth: 1,
      objectNameSingular,
    });

  const setRecordInStore = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        set(recordStoreFamilyState(record.id), record);
      },
    [],
  );
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useOnDbEvent({
    input: { recordId, action: DatabaseEventAction.UPDATED },
    onData: (data) => {
      const updatedRecord = data.onDbEvent.record;

      const cachedRecord = getRecordFromCache<ObjectRecord>(recordId);
      const cachedRecordNode = getRecordNodeFromRecord<ObjectRecord>({
        record: cachedRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: false,
      });

      const shouldHandleOptimisticCache =
        isDefined(cachedRecordNode) && isDefined(cachedRecord);

      if (shouldHandleOptimisticCache) {
        const computedOptimisticRecord: ObjectRecord = {
          ...cachedRecord,
          ...updatedRecord,
          id: recordId,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          record: computedOptimisticRecord,
          recordGqlFields: computedRecordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        triggerUpdateRecordOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          currentRecord: cachedRecordNode,
          updatedRecord: updatedRecord,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });

        setRecordInStore(computedOptimisticRecord);
      }
    },
    skip: listenedFields.length === 0,
  });

  return null;
};
