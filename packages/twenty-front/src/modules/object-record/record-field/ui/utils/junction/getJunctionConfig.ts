import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type JunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/JunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';
import { isValidJunctionTargetField } from './isValidJunctionTargetField';

type GetJunctionConfigArgs = {
  settings: FieldMetadataItem['settings'] | undefined;
  relationObjectMetadataId: string;
  relationTargetFieldMetadataId?: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

export const getJunctionConfig = ({
  settings,
  relationObjectMetadataId,
  relationTargetFieldMetadataId,
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

    const relationField = junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relation?.targetObjectMetadata.id === sourceObjectMetadataId &&
        field.id !== excludeFieldId,
    );

    if (isDefined(relationField)) {
      return relationField;
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

  const hasConfiguredTargetField = hasJunctionTargetFieldId(settings);
  const configuredTargetField = hasConfiguredTargetField
    ? junctionObjectMetadata.fields.find(
        (field) => field.id === settings.junctionTargetFieldId,
      )
    : undefined;
  const relationSourceField = isDefined(relationTargetFieldMetadataId)
    ? junctionObjectMetadata.fields.find(
        (field) => field.id === relationTargetFieldMetadataId,
      )
    : undefined;
  const sourceField =
    relationSourceField ?? findSourceField(configuredTargetField?.id);
  const invalidConfiguredJunction: JunctionConfig = {
    junctionObjectMetadata,
    targetFields: [],
    isMorphRelation: false,
    isValid: false,
  };

  // Legacy workspaces can lack the target marker. Only infer a pure junction:
  // an unlabeled intermediate record with exactly one morph target.
  const inferredMorphTargetFields = hasConfiguredTargetField
    ? []
    : junctionObjectMetadata.fields.filter(
        (field) => field.type === FieldMetadataType.MORPH_RELATION,
      );
  const labelIdentifierField = junctionObjectMetadata.fields.find(
    (field) =>
      field.id === junctionObjectMetadata.labelIdentifierFieldMetadataId,
  );
  const targetField =
    configuredTargetField ??
    (sourceField?.type === FieldMetadataType.RELATION &&
    labelIdentifierField?.type === FieldMetadataType.UUID &&
    inferredMorphTargetFields.length === 1
      ? inferredMorphTargetFields[0]
      : undefined);

  if (!isDefined(targetField)) {
    return hasConfiguredTargetField ? invalidConfiguredJunction : null;
  }

  if (
    !isValidJunctionTargetField({
      fieldMetadataItem: targetField,
      sourceFieldMetadataId: relationTargetFieldMetadataId,
    })
  ) {
    return hasConfiguredTargetField ? invalidConfiguredJunction : null;
  }

  const isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

  return {
    junctionObjectMetadata,
    targetFields: [targetField],
    sourceField,
    isMorphRelation,
    isValid: true,
  };
};
