import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { isNull } from '@sniptt/guards';

export type UseOptimisticUpdateForLastViewedAtProps = {
  objectNameSingular: string;
};

export const useOptimisticUpdateForLastViewedAt = ({
  objectNameSingular,
}: UseOptimisticUpdateForLastViewedAtProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({ objectNameSingular, depth: 1 });

  const getRecordFromCache = useGetRecordFromCache({ objectNameSingular });

  const optimisticallyMarkLastViewedAt = (idToUpdate: string) => {
    const cachedRecord = getRecordFromCache<ObjectRecord>(idToUpdate);
    const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
      record: cachedRecord,
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields: depthOneRecordGqlFields,
      computeReferences: false,
    });

    const optimisticRecordInput = {
      lastViewedAt: new Date().toISOString(),
    } as Partial<ObjectRecord>;

    const computedOptimisticRecord = {
      ...cachedRecord,
      ...optimisticRecordInput,
      id: idToUpdate,
      __typename: getObjectTypename(objectMetadataItem.nameSingular),
    } as ObjectRecord;

    const optimisticRecordWithConnection =
      getRecordNodeFromRecord<ObjectRecord>({
        record: computedOptimisticRecord,
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields: depthOneRecordGqlFields,
        computeReferences: false,
      });

    const shouldHandleOptimisticCache =
      !isNull(cachedRecord) &&
      isDefined(optimisticRecordWithConnection) &&
      isDefined(cachedRecordWithConnection);

    if (!shouldHandleOptimisticCache) return;

    const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItem,
      objectMetadataItems,
      record: optimisticRecordInput,
      depth: 1,
    });

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: computedOptimisticRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });

    triggerUpdateRecordOptimisticEffect({
      cache: apolloCoreClient.cache,
      objectMetadataItem,
      currentRecord: cachedRecordWithConnection,
      updatedRecord: optimisticRecordWithConnection,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });
  };

  return { optimisticallyMarkLastViewedAt };
};
