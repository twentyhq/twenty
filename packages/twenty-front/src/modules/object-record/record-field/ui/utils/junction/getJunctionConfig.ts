import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';
import { hasJunctionTargetMorphId } from './hasJunctionTargetMorphId';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type JunctionConfig = {
  junctionObjectMetadata: ObjectMetadataItem;
  targetFields: FieldMetadataItem[];
  sourceField?: FieldMetadataItem;
  isMorphRelation: boolean;
};

type GetJunctionConfigArgs = {
  settings: FieldMetadataItem['settings'] | undefined;
  relationObjectMetadataId: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: ObjectMetadataItem[];
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

  // Find the source field on junction (points back to the source object)
  // Checks both RELATION and MORPH_RELATION fields
  const findSourceField = (
    excludeFieldId?: string,
  ): FieldMetadataItem | undefined => {
    if (!isDefined(sourceObjectMetadataId)) {
      return undefined;
    }

    // First check regular RELATION fields
    const relationField = junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relation?.targetObjectMetadata.id === sourceObjectMetadataId &&
        field.id !== excludeFieldId,
    );

    if (isDefined(relationField)) {
      return relationField;
    }

    // Then check MORPH_RELATION fields that have a morphRelation targeting the source
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

  let targetFields: FieldMetadataItem[] = [];
  let isMorphRelation = false;

  // Handle morph-based junction config (junctionTargetMorphId)
  if (hasJunctionTargetMorphId(settings) === true) {
    targetFields = junctionObjectMetadata.fields.filter(
      (field) => field.morphId === settings.junctionTargetMorphId,
    );
    isMorphRelation = true;

    if (targetFields.length === 0) {
      return null;
    }

    return {
      junctionObjectMetadata,
      targetFields,
      sourceField: findSourceField(),
      isMorphRelation,
    };
  }

  // Handle single field ID junction config (junctionTargetFieldId)
  if (hasJunctionTargetFieldId(settings) === true) {
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === settings.junctionTargetFieldId,
    );

    if (!isDefined(targetField)) {
      return null;
    }

    isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

    // For regular relations, validate the relation exists
    if (!isMorphRelation && !isDefined(targetField.relation)) {
      return null;
    }

    targetFields = [targetField];

    return {
      junctionObjectMetadata,
      targetFields,
      sourceField: findSourceField(settings.junctionTargetFieldId),
      isMorphRelation,
    };
  }

  return null;
};
