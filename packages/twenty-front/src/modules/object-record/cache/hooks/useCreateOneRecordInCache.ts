import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';

export const useCreateOneRecordInCache = <T extends ObjectRecord>() => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const apolloCoreClient = useApolloCoreClient();

  return ({
    objectMetadataItem,
    record,
  }: {
    objectMetadataItem: EnrichedObjectMetadataItem;
    record: ObjectRecord;
  }) => {
    const prefilledRecord = prefillRecord({
      objectMetadataItem,
      input: record,
    });
    const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      record: prefilledRecord,
      depth: 1,
    });

    updateRecordFromCache({
      cache: apolloCoreClient.cache,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      record: prefilledRecord,
      recordGqlFields,
    });

    return getRecordFromCache<T>({
      cache: apolloCoreClient.cache,
      recordId: record.id,
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    }) as T;
  };
};
