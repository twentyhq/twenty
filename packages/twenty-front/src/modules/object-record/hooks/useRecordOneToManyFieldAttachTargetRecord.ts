import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';

import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecordV2 } from '@/object-record/hooks/useUpdateOneRecordV2';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldName,
  CustomError,
  isDefined,
} from 'twenty-shared/utils';

export const useRecordOneToManyFieldAttachTargetRecord = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { updateOneRecord } = useUpdateOneRecordV2();

  const recordOneToManyFieldAttachTargetRecord = async ({
    sourceObjectNameSingular,
    sourceFieldMetadataName,
    sourceFieldMetadataType,
    targetObjectNameSingular,
    targetObjectNamePlural,
    targetGQLFieldName,
    sourceRecordId,
    targetRecordId,
  }: {
    sourceObjectNameSingular: string;
    sourceFieldMetadataName: string;
    sourceFieldMetadataType:
      | FieldMetadataType.RELATION
      | FieldMetadataType.MORPH_RELATION;
    targetObjectNameSingular: string;
    targetObjectNamePlural: string;
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

      const gqlFields = computeDepthOneRecordGqlFieldsFromRecord({
        objectMetadataItem: targetObjectMetadataItem,
        record: previousRecordWithRelation,
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

    const previousRecord = getRecordFromCache({
      objectMetadataItem: sourceObjectMetadataItem,
      recordId: sourceRecordId,
      cache: apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });

    if (!previousRecord) {
      throw new Error('Could not find cached source record');
    }
    // getRecordFromCache acts diffferently for a morph relation and for a relation field
    // so we need to deduplicate
    const sourceFieldMetadataNameComputed =
      sourceFieldMetadataType === FieldMetadataType.RELATION
        ? sourceFieldMetadataName
        : computeMorphRelationFieldName({
            fieldName: sourceFieldMetadataName,
            relationType: RelationType.ONE_TO_MANY,
            targetObjectMetadataNameSingular: targetObjectNameSingular,
            targetObjectMetadataNamePlural: targetObjectNamePlural,
          });
    const deduplicatedRecords = [
      ...previousRecord[sourceFieldMetadataNameComputed],
      cachedTargetRecord,
    ].reduce<ObjectRecord[]>((deduplicatedArray, record) => {
      if (
        !deduplicatedArray.some(
          (deduplicatedRecord) => deduplicatedRecord.id === record.id,
        )
      ) {
        deduplicatedArray.push(record);
      }
      return deduplicatedArray;
    }, []);

    const previousRecordWithUpdatedRelation = {
      ...previousRecord,
      [sourceFieldMetadataNameComputed]: deduplicatedRecords,
    };

    const gqlFields = computeDepthOneRecordGqlFieldsFromRecord({
      objectMetadataItem: sourceObjectMetadataItem,
      record: previousRecord,
    });

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem: sourceObjectMetadataItem,
      cache: apolloCoreClient.cache,
      record: previousRecordWithUpdatedRelation,
      recordGqlFields: gqlFields,
      objectPermissionsByObjectMetadataId,
    });
  };

  return { recordOneToManyFieldAttachTargetRecord };
};
