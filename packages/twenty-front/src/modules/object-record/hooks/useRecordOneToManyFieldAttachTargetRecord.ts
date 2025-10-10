import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';

import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecordV2 } from '@/object-record/hooks/useUpdateOneRecordV2';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useRecordOneToManyFieldAttachTargetRecord = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { updateOneRecord } = useUpdateOneRecordV2();

  const recordOneToManyFieldAttachTargetRecord = async ({
    sourceObjectNameSingular,
    targetObjectNameSingular,
    targetGQLFieldName,
    sourceRecordId,
    targetRecordId,
  }: {
    sourceObjectNameSingular: string;
    targetObjectNameSingular: string;
    targetGQLFieldName: string;
    sourceRecordId: string;
    targetRecordId: string;
  }) => {
    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === targetObjectNameSingular,
    );

    const sourceObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === sourceObjectNameSingular,
    );

    if (!targetObjectMetadataItem) {
      throw new CustomError(
        `Could not find related object metadata for ${targetObjectNameSingular}`,
        'RELATED_OBJECT_METADATA_NOT_FOUND',
      );
    }

    if (!sourceObjectMetadataItem) {
      throw new CustomError(
        `Could not find source object metadata for ${sourceObjectNameSingular}`,
        'SOURCE_OBJECT_METADATA_NOT_FOUND',
      );
    }

    const cachedTargetRecord = getRecordFromCache({
      objectMetadataItem: targetObjectMetadataItem,
      recordId: targetRecordId,
      cache: apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });

    if (!cachedTargetRecord) {
      throw new Error('Could not find cached related record');
    }

    const previousRecordId = cachedTargetRecord?.[`${targetGQLFieldName}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache({
        objectMetadataItem: sourceObjectMetadataItem,
        recordId: previousRecordId,
        cache: apolloCoreClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });

      const previousRecordWithRelation = {
        ...cachedTargetRecord,
        [targetGQLFieldName]: previousRecord,
      };

      const gqlFields = generateDepthRecordGqlFieldsFromRecord({
        objectMetadataItem: targetObjectMetadataItem,
        objectMetadataItems,
        record: previousRecordWithRelation,
        depth: 1,
      });

      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem: targetObjectMetadataItem,
        cache: apolloCoreClient.cache,
        record: {
          ...cachedTargetRecord,
          [targetGQLFieldName]: previousRecord,
        },
        recordGqlFields: gqlFields,
        objectPermissionsByObjectMetadataId,
      });
    }

    await updateOneRecord({
      objectNameSingular: targetObjectNameSingular,
      idToUpdate: targetRecordId,
      updateOneRecordInput: {
        [`${targetGQLFieldName}Id`]: sourceRecordId,
      },
    });
  };

  return { recordOneToManyFieldAttachTargetRecord };
};
