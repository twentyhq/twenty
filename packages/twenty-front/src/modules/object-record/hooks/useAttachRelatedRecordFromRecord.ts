import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';

import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateMultipleRecordsManyToOneObjects } from '@/object-record/hooks/useUpdateMultipleRecordsManyToOneObjects';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getRelatedRecordFieldDefinition } from '@/object-record/utils/getRelatedRecordFieldDefinition';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

type useAttachRelatedRecordFromRecordProps = {
  recordObjectNameSingular: string;
  relationTargetGQLfieldName: string;
};

export const useAttachRelatedRecordFromRecord = ({
  recordObjectNameSingular,
  relationTargetGQLfieldName,
}: useAttachRelatedRecordFromRecordProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const { fieldDefinition } = useContext(FieldContext);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordObjectNameSingular,
  });
  const { updateMultipleRecordsManyToOneObjects } =
    useUpdateMultipleRecordsManyToOneObjects();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const updateOneRecordAndAttachRelations = async ({
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
      throw new CustomError(
        `Could not find record related to ${recordObjectNameSingular}`,
        'RELATED_RECORD_NOT_FOUND',
      );
    }

    const relatedObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === relatedRecordObjectNameSingular,
    );

    if (!relatedObjectMetadataItem) {
      throw new CustomError(
        `Could not find related object metadata for ${relatedRecordObjectNameSingular}`,
        'RELATED_OBJECT_METADATA_NOT_FOUND',
      );
    }

    const fieldOnRelatedObject =
      fieldOnObject?.relation?.targetFieldMetadata.name;

    if (!fieldOnRelatedObject) {
      throw new CustomError(
        `Missing target field for ${relationTargetGQLfieldName}`,
        'MISSING_TARGET_FIELD',
      );
    }

    const cachedRelatedRecord = getRecordFromCache({
      objectMetadataItem: relatedObjectMetadataItem,
      recordId: relatedRecordId,
      cache: apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });

    if (!cachedRelatedRecord) {
      throw new Error('Could not find cached related record');
    }

    const previousRecordId = cachedRelatedRecord?.[`${fieldOnRelatedObject}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache({
        objectMetadataItem: objectMetadataItem,
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

    assertFieldMetadata(
      FieldMetadataType.RELATION,
      isFieldRelation,
      fieldDefinition,
    );

    const relatedRecordFieldDefinition = getRelatedRecordFieldDefinition({
      fieldDefinition: fieldDefinition,
      relatedObjectMetadataItem,
    });

    if (!isDefined(relatedRecordFieldDefinition)) {
      throw new Error('Could not find related record field definition');
    }

    const updatedManyRecordsArgs = [
      {
        idToUpdate: relatedRecordId,
        objectMetadataItem: relatedObjectMetadataItem,
        targetObjectNameSingulars: [objectMetadataItem.nameSingular],
        relatedRecordId: recordId,
        targetGQLFieldName: relationTargetGQLfieldName,
      },
    ];

    await updateMultipleRecordsManyToOneObjects(updatedManyRecordsArgs);
  };

  return { updateOneRecordAndAttachRelations };
};
