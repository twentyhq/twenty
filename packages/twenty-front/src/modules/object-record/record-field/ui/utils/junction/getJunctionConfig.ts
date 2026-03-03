import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';

export type JunctionObjectMetadataItem = Pick<
  ObjectMetadataItem,
  | 'id'
  | 'fields'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
  | 'nameSingular'
  | 'namePlural'
>;

export type JunctionConfig = {
  junctionObjectMetadata: JunctionObjectMetadataItem;
  targetFields: FieldMetadataItem[];
  sourceField?: FieldMetadataItem;
  isMorphRelation: boolean;
};

type GetJunctionConfigArgs = {
  settings: FieldMetadataItem['settings'] | undefined;
  relationObjectMetadataId: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

// Resolves the target object ID using the relation resolver first,
// falling back to inverse relation search.
const getTargetObjectIdFromItems = (
  field: FieldMetadataItem,
  objectMetadataItems: JunctionObjectMetadataItem[],
): string | undefined => {
  if (isDefined(field.relation?.targetObjectMetadata?.id)) {
    return field.relation.targetObjectMetadata.id;
  }

  for (const obj of objectMetadataItems) {
    for (const otherField of obj.fields) {
      if (
        otherField.type === FieldMetadataType.RELATION &&
        otherField.relation?.targetFieldMetadata.id === field.id
      ) {
        return obj.id;
      }
    }
  }

  return undefined;
};

export const getJunctionConfig = ({
  settings,
  relationObjectMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
}: GetJunctionConfigArgs): JunctionConfig | null => {
  const junctionObjectMetadata = objectMetadataItems.find(
    (item) => item.id === relationObjectMetadataId,
  );

  if (!isDefined(junctionObjectMetadata)) {
    return null;
  }

  const findSourceField = (
    excludeFieldId?: string,
  ): FieldMetadataItem | undefined => {
    if (!isDefined(sourceObjectMetadataId)) {
      return undefined;
    }

    // Primary: match by relation.targetObjectMetadata.id
    const relationField = junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.id !== excludeFieldId &&
        field.relation?.targetObjectMetadata?.id === sourceObjectMetadataId,
    );

    if (isDefined(relationField)) {
      return relationField;
    }

    // Fallback: when relation is null, resolve via inverse search
    const fallbackField = junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.id !== excludeFieldId &&
        getTargetObjectIdFromItems(field, objectMetadataItems) ===
          sourceObjectMetadataId,
    );

    if (isDefined(fallbackField)) {
      return fallbackField;
    }

    return junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        field.id !== excludeFieldId &&
        field.morphRelations?.some(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.id === sourceObjectMetadataId,
        ),
    );
  };

  if (!hasJunctionTargetFieldId(settings)) {
    return null;
  }

  const targetField = junctionObjectMetadata.fields.find(
    (field) => field.id === settings.junctionTargetFieldId,
  );

  if (!isDefined(targetField)) {
    return null;
  }

  const isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

  // Accept the target field as long as it's a RELATION type (even if
  // the relation resolver returned null). The field was already located
  // by junctionTargetFieldId so we know it's valid.
  if (
    !isMorphRelation &&
    targetField.type !== FieldMetadataType.RELATION &&
    !isDefined(targetField.relation)
  ) {
    return null;
  }

  return {
    junctionObjectMetadata,
    targetFields: [targetField],
    sourceField: findSourceField(settings.junctionTargetFieldId),
    isMorphRelation,
  };
};
