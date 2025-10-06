import { type Reference } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateMultipleRecordsManyToOneObjects } from '@/object-record/hooks/useUpdateMultipleRecordsManyToOneObjects';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
type useDetachRelatedRecordFromRecordProps = {
  recordObjectNameSingular: string;
  relationTargetGQLfieldName: string;
};

export const useDetachRelatedRecordFromRecord = ({
  recordObjectNameSingular,
  relationTargetGQLfieldName,
}: useDetachRelatedRecordFromRecordProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const { fieldDefinition } = useContext(FieldContext);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordObjectNameSingular,
  });

  const { updateMultipleRecordsManyToOneObjects } =
    useUpdateMultipleRecordsManyToOneObjects();

  const { objectMetadataItems } = useObjectMetadataItems();

  const updateOneRecordAndDetachRelations = async ({
    recordId,
    relatedRecordId,
  }: {
    recordId: string;
    relatedRecordId: string;
  }) => {
    const fieldOnObject = objectMetadataItem.readableFields.find((field) => {
      return field.name === relationTargetGQLfieldName;
    });

    const relatedRecordObjectNameSingular =
      fieldOnObject?.relation?.targetObjectMetadata.nameSingular;

    if (!relatedRecordObjectNameSingular) {
      throw new Error(
        `Could not find record related to ${recordObjectNameSingular}`,
      );
    }

    const relatedObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === relatedRecordObjectNameSingular,
    );

    if (!relatedObjectMetadataItem) {
      throw new Error('Could not find related object metadata item');
    }

    assertFieldMetadata(
      FieldMetadataType.RELATION,
      isFieldRelation,
      fieldDefinition,
    );

    modifyRecordFromCache({
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      fieldModifiers: {
        [relationTargetGQLfieldName]: (
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
                  getRefName(relatedRecordObjectNameSingular, relatedRecordId)
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
        objectMetadataItem: relatedObjectMetadataItem,
        targetObjectNameSingulars: [objectMetadataItem.nameSingular],
        relatedRecordId: null,
        targetGQLFieldName: relationTargetGQLfieldName,
      },
    ];

    await updateMultipleRecordsManyToOneObjects(updatedManyRecordsArgs);
  };

  return { updateOneRecordAndDetachRelations };
};
