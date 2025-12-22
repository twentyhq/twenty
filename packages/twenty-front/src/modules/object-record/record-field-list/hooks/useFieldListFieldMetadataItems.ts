import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import groupBy from 'lodash.groupby';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type UseFieldListFieldMetadataItemsProps = {
  objectNameSingular: string;
  excludeFieldMetadataIds?: string[];
  excludeCreatedAtAndUpdatedAt?: boolean;
  showRelationSections?: boolean;
};

export const useFieldListFieldMetadataItems = ({
  objectNameSingular,
  excludeFieldMetadataIds = [],
  showRelationSections = true,
  excludeCreatedAtAndUpdatedAt = true,
}: UseFieldListFieldMetadataItemsProps) => {
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const filteredFields = objectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
      fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id &&
      !excludeFieldMetadataIds.includes(fieldMetadataItem.id) &&
      (!excludeCreatedAtAndUpdatedAt ||
        (fieldMetadataItem.name !== 'createdAt' &&
          fieldMetadataItem.name !== 'deletedAt')) &&
      (showRelationSections ||
        (fieldMetadataItem.type !== FieldMetadataType.RELATION &&
          fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION)),
  );

  // Sort fields based on detailFieldOrder if available, otherwise alphabetically
  const availableFieldMetadataItems = (() => {
    const detailFieldOrder = objectMetadataItem.detailFieldOrder;

    if (!detailFieldOrder || detailFieldOrder.length === 0) {
      // Default alphabetical sorting
      return filteredFields.sort((fieldMetadataItemA, fieldMetadataItemB) =>
        fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
      );
    }

    // Create a map for quick lookup
    const fieldMap = new Map(
      filteredFields.map((field) => [field.id, field]),
    );

    // Sort based on custom order
    const orderedFields: typeof filteredFields = [];
    const remainingFields = new Set(filteredFields.map((f) => f.id));

    // Add fields in the specified order
    for (const fieldId of detailFieldOrder) {
      const field = fieldMap.get(fieldId);
      if (field) {
        orderedFields.push(field);
        remainingFields.delete(fieldId);
      }
    }

    // Add any remaining fields (new fields not in the saved order) alphabetically
    const newFields = Array.from(remainingFields)
      .map((id) => fieldMap.get(id))
      .filter(isDefined)
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...orderedFields, ...newFields];
  })();

  const { inlineFieldMetadataItems, relationFieldMetadataItems } = groupBy(
    availableFieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.name !== 'createdAt' &&
          fieldMetadataItem.name !== 'deletedAt',
      )
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
      ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION ||
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
        ? 'relationFieldMetadataItems'
        : 'inlineFieldMetadataItems',
  );

  const inlineRelationFieldMetadataItems = (
    relationFieldMetadataItems ?? []
  ).filter(
    (fieldMetadataItem) =>
      (objectNameSingular === CoreObjectNameSingular.Note &&
        fieldMetadataItem.name === 'noteTargets') ||
      (objectNameSingular === CoreObjectNameSingular.Task &&
        fieldMetadataItem.name === 'taskTargets'),
  );

  const boxedRelationFieldMetadataItems = (relationFieldMetadataItems ?? [])
    .filter(
      (fieldMetadataItem) =>
        !(
          (objectNameSingular === CoreObjectNameSingular.Note &&
            fieldMetadataItem.name === 'noteTargets') ||
          (objectNameSingular === CoreObjectNameSingular.Task &&
            fieldMetadataItem.name === 'taskTargets')
        ),
    )
    .filter((fieldMetadataItem) => {
      const canReadRelation =
        isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          fieldMetadataItem.relation?.targetObjectMetadata.id,
        ).canReadObjectRecords;

      const canReadMorphRelation = fieldMetadataItem?.morphRelations?.every(
        (morphRelation) =>
          isDefined(morphRelation.targetObjectMetadata.id) &&
          getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            morphRelation.targetObjectMetadata.id,
          ).canReadObjectRecords,
      );

      return canReadRelation || canReadMorphRelation;
    });

  return {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  };
};
