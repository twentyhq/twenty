import { type Reference } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateMultipleRecordsFromManyObjects } from '@/object-record/hooks/useUpdateMultipleRecordsFromManyObjects';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useDetachMorphRelatedRecordFromRecord = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { fieldDefinition } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateMultipleRecordsFromManyObjects } =
    useUpdateMultipleRecordsFromManyObjects();

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

  const updateOneRecordAndDetachMorphRelations = useRecoilCallback(
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
            const currentMorphFieldValue = parentRecord[
              fieldDefinition.metadata.fieldName
            ] as ObjectRecord[];

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

            if (Array.isArray(currentMorphFieldValue)) {
              set(recordStoreFamilyState(recordId), {
                ...parentRecord,
                [fieldDefinition.metadata.fieldName]:
                  currentMorphFieldValue.filter(
                    (record) => record.id !== relatedRecordId,
                  ),
              });
            }
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

        const { objectMetadataItem: relatedObjectMetadataItem } =
          relatedObjectMetadataItemsWithCachedRecord;

        modifyRecordFromCache({
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          fieldModifiers: {
            [fieldDefinition.metadata.fieldName]: (
              fieldNameOnRecordObjectConnection,
              { readField },
            ) => {
              const edges = readField<{ node: Reference }[]>(
                'edges',
                fieldNameOnRecordObjectConnection,
              );

              if (!edges) return fieldNameOnRecordObjectConnection;

              return {
                ...fieldNameOnRecordObjectConnection,
                edges: edges.filter(
                  (edge) =>
                    !(
                      edge.node.__ref ===
                      getRefName(
                        relatedObjectMetadataItem.nameSingular,
                        relatedRecordId,
                      )
                    ),
                ),
              };
            },
          },
          recordId,
        });

        const updatedManyRecordsArgs = [
          {
            idToUpdate: relatedRecordId,
            objectNameSingulars,
            relatedRecordId: null,
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

  return { updateOneRecordAndDetachMorphRelations };
};
