import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateMultipleRecordsManyToOneObjects } from '@/object-record/hooks/useUpdateMultipleRecordsManyToOneObjects';
import { getTargetFieldMetadataName } from '@/object-record/multiple-objects/utils/getTargetFieldMetadataName';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useAttachMorphRelatedRecordFromRecord = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { fieldDefinition } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateMultipleRecordsFromManyObjects } =
    useUpdateMultipleRecordsManyToOneObjects();

  if (!isFieldMorphRelation(fieldDefinition)) {
    throw new Error('Field is not a morph relation');
  }

  const objectNameSingular =
    fieldDefinition.metadata.morphRelations[0].sourceObjectMetadata
      .nameSingular;
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Could not find object metadata item');
  }

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const updateOneRecordAndAttachMorphRelations = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
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

        const parentRecord = snapshot
          .getLoadable(recordStoreFamilyState(recordId))
          .getValue();

        if (isDefined(parentRecord)) {
          relatedObjectMetadataItems.forEach((relatedObjectMetadataItem) => {
            const currentMorphFieldValue =
              parentRecord[fieldDefinition.metadata.fieldName];

            const objectRecordFromCache = getRecordFromCache({
              objectMetadataItem: relatedObjectMetadataItem,
              recordId: relatedRecordId,
              cache: apolloCoreClient.cache,
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
            });

            if (!isDefined(objectRecordFromCache)) {
              return;
            }

            set(recordStoreFamilyState(recordId), {
              ...parentRecord,
              [fieldDefinition.metadata.fieldName]: [
                ...currentMorphFieldValue,
                objectRecordFromCache,
              ],
            });
          });
        }

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

        if (
          !isDefined(cachedRelatedRecord) ||
          !isDefined(cachedRelatedRecord.id)
        ) {
          throw new Error('Could not find cached related record');
        }

        const fieldOnRelatedObject = getTargetFieldMetadataName({
          fieldDefinition,
          objectNameSingular: relatedObjectMetadataItem.nameSingular,
        });
        if (!isDefined(fieldOnRelatedObject)) {
          throw new Error('Could not find field on related object');
        }

        const previousRecordId =
          cachedRelatedRecord?.[`${fieldOnRelatedObject}Id`];

        if (isDefined(previousRecordId)) {
          const previousRecord = getRecordFromCache<ObjectRecord>({
            objectMetadataItem,
            recordId: previousRecordId,
            cache: apolloCoreClient.cache,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
          });

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
            objectMetadataItem,
            // recordGqlFields: gqlFields,
          },
        ];

        await updateMultipleRecordsFromManyObjects(updatedManyRecordsArgs);
      },
    [
      fieldDefinition,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      updateMultipleRecordsFromManyObjects,
      apolloCoreClient.cache,
      objectMetadataItem,
    ],
  );

  return { updateOneRecordAndAttachMorphRelations };
};
