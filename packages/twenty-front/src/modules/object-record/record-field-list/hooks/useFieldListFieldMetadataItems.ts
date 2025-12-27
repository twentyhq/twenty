import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import groupBy from 'lodash.groupby';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Check if a relation field is configured as a junction relation (many-to-many through junction)
const isJunctionRelationField = (
  fieldMetadataItem: FieldMetadataItem,
): boolean => {
  if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
    return false;
  }
  const settings = fieldMetadataItem.settings as {
    junctionTargetRelationFieldIds?: string[];
  };
  return (
    isDefined(settings?.junctionTargetRelationFieldIds) &&
    settings.junctionTargetRelationFieldIds.length > 0
  );
};

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

  const availableFieldMetadataItems = objectMetadataItem.readableFields
    .filter(
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
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

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

  // Activity target relations (hardcoded noteTargets/taskTargets) - rendered with ActivityTargetsInlineCell
  const isActivityTargetRelation = (fieldMetadataItem: FieldMetadataItem) =>
    (objectNameSingular === CoreObjectNameSingular.Note &&
      fieldMetadataItem.name === 'noteTargets') ||
    (objectNameSingular === CoreObjectNameSingular.Task &&
      fieldMetadataItem.name === 'taskTargets');

  const activityTargetFieldMetadataItems = (
    relationFieldMetadataItems ?? []
  ).filter(isActivityTargetRelation);

  // Junction relations (many-to-many through junction) - rendered inline with RecordInlineCell
  const junctionRelationFieldMetadataItems = (
    relationFieldMetadataItems ?? []
  ).filter(
    (fieldMetadataItem) =>
      !isActivityTargetRelation(fieldMetadataItem) &&
      isJunctionRelationField(fieldMetadataItem),
  );

  // Keep backwards compatibility alias
  const inlineRelationFieldMetadataItems = activityTargetFieldMetadataItems;

  const boxedRelationFieldMetadataItems = (relationFieldMetadataItems ?? [])
    .filter(
      (fieldMetadataItem) =>
        !isActivityTargetRelation(fieldMetadataItem) &&
        !isJunctionRelationField(fieldMetadataItem),
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
    junctionRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  };
};
