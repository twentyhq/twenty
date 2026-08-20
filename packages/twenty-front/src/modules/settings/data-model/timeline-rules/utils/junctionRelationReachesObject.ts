import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A morph group is served as a single field carrying one member's id, so the
// settings id can point at a member the store does not list. Fall back to the
// junction object's morph field when the exact id is absent.
const findJunctionTargetFieldMetadataItem = ({
  junctionObjectMetadataItem,
  junctionTargetFieldId,
  sourceFieldMetadataId,
}: {
  junctionObjectMetadataItem: EnrichedObjectMetadataItem;
  junctionTargetFieldId: string;
  sourceFieldMetadataId: string | undefined;
}): FieldMetadataItem | undefined => {
  const exactFieldMetadataItem = junctionObjectMetadataItem.fields.find(
    (field) => field.id === junctionTargetFieldId,
  );

  if (isDefined(exactFieldMetadataItem)) {
    return exactFieldMetadataItem;
  }

  const morphFieldMetadataItems = junctionObjectMetadataItem.fields.filter(
    (field) =>
      field.type === FieldMetadataType.MORPH_RELATION &&
      field.id !== sourceFieldMetadataId,
  );

  return morphFieldMetadataItems.length === 1
    ? morphFieldMetadataItems[0]
    : undefined;
};

export const junctionRelationReachesObject = ({
  relationFieldMetadataItem,
  objectMetadataItem,
  objectMetadataItems,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): boolean => {
  const relationTargetObjectMetadataId =
    relationFieldMetadataItem.relation?.targetObjectMetadata.id;
  const settings = relationFieldMetadataItem.settings;

  if (
    !isDefined(relationTargetObjectMetadataId) ||
    !hasJunctionTargetFieldId(settings)
  ) {
    return false;
  }

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === relationTargetObjectMetadataId,
  );

  if (!isDefined(junctionObjectMetadataItem)) {
    return false;
  }

  const junctionTargetFieldMetadataItem = findJunctionTargetFieldMetadataItem({
    junctionObjectMetadataItem,
    junctionTargetFieldId: settings.junctionTargetFieldId,
    sourceFieldMetadataId:
      relationFieldMetadataItem.relation?.targetFieldMetadata?.id,
  });

  if (!isDefined(junctionTargetFieldMetadataItem)) {
    return false;
  }

  return getTargetObjectMetadataIdsFromField(
    junctionTargetFieldMetadataItem,
  ).includes(objectMetadataItem.id);
};

// A many-to-one relation reaches the object its join column points at.
export const manyToOneRelationReachesObject = ({
  relationFieldMetadataItem,
  objectMetadataItem,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
}): boolean =>
  relationFieldMetadataItem.type === FieldMetadataType.RELATION &&
  relationFieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
  relationFieldMetadataItem.relation.targetObjectMetadata.id ===
    objectMetadataItem.id;

export const relationRuleReachesObject = ({
  relationFieldMetadataItem,
  objectMetadataItem,
  objectMetadataItems,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): boolean =>
  junctionRelationReachesObject({
    relationFieldMetadataItem,
    objectMetadataItem,
    objectMetadataItems,
  }) ||
  manyToOneRelationReachesObject({
    relationFieldMetadataItem,
    objectMetadataItem,
  });
