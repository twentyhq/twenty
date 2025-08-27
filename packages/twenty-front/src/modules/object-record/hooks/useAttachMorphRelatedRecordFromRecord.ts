import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateManyRecordsFromManyObjects } from '@/object-record/hooks/useUpdateManyRecordsFromManyObjects';
import { getTargetFieldMetadataName } from '@/object-record/multiple-objects/utils/getTargetFieldMetadataName';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAttachMorphRelatedRecordFromRecord = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { fieldDefinition } = useContext(FieldContext);

  const { updateManyRecordsFromManyObjects } =
    useUpdateManyRecordsFromManyObjects();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const updateOneRecordAndAttachMorphRelations = async ({
    recordId,
    relatedRecordId,
    objectNameSingulars,
  }: {
    recordId: string;
    relatedRecordId: string;
    objectNameSingulars: string[];
  }) => {
    const relatedObjectMetadataItems = objectMetadataItems.filter(
      (objectMetadataItem) =>
        objectNameSingulars.includes(objectMetadataItem.nameSingular),
    );

    const relatedObjectMetadataItemsWithCachedRecord =
      relatedObjectMetadataItems
        .map((objectMetadataItem) => {
          const cachedRelatedRecord = getRecordFromCache<ObjectRecord>({
            objectMetadataItem,
            recordId: relatedRecordId,
            cache: apolloCoreClient.cache,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
          });
          return {
            cachedRelatedRecord,
            objectMetadataItem,
          };
        })
        .find((item) => isDefined(item.cachedRelatedRecord));

    if (!relatedObjectMetadataItemsWithCachedRecord) {
      throw new Error('Could not find cached related record');
    }

    const {
      objectMetadataItem: relatedObjectMetadataItem,
      cachedRelatedRecord,
    } = relatedObjectMetadataItemsWithCachedRecord;

    if (!isDefined(cachedRelatedRecord) || !isDefined(cachedRelatedRecord.id)) {
      throw new Error('Could not find cached related record');
    }

    const fieldOnRelatedObject = getTargetFieldMetadataName({
      fieldDefinition,
      objectNameSingular: relatedObjectMetadataItem.nameSingular,
    });
    if (!isDefined(fieldOnRelatedObject)) {
      throw new Error('Could not find field on related object');
    }

    const previousRecordId = cachedRelatedRecord?.[`${fieldOnRelatedObject}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache<ObjectRecord>(previousRecordId);

      const previousRecordWithRelation = {
        ...cachedRelatedRecord,
        [fieldOnRelatedObject]: previousRecord,
      };
      const gqlFields = computeDepthOneRecordGqlFieldsFromRecord({
        objectMetadataItem: relatedObjectMetadataItem,
        record: previousRecordWithRelation,
      });
      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem: relatedObjectMetadataItem,
        cache: apolloCoreClient.cache,
        record: {
          ...cachedRelatedRecord,
          [fieldOnRelatedObject]: previousRecord,
        },
        recordGqlFields: gqlFields,
        objectPermissionsByObjectMetadataId,
      });
    }

    const updatedManyRecordsArgs = [
      {
        idToUpdate: relatedRecordId,
        objectNameSingulars,
        relatedRecordId: recordId,
        // recordGqlFields: gqlFields,
      },
    ];

    await updateManyRecordsFromManyObjects(updatedManyRecordsArgs);
  };

  return { updateOneRecordAndAttachMorphRelations };
};
