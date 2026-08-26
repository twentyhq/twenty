import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';

export type JunctionObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
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

  const configuredTargetField = hasJunctionTargetFieldId(settings)
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

  // Legacy workspaces can lack the target marker. Only infer a pure junction:
  // an unlabeled intermediate record with exactly one morph target.
  const inferredMorphTargetFields = isDefined(configuredTargetField)
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
    return null;
  }

  const isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

  if (!isMorphRelation && !isDefined(targetField.relation)) {
    return null;
  }

  return {
    junctionObjectMetadata,
    targetFields: [targetField],
    sourceField,
    isMorphRelation,
  };
};
