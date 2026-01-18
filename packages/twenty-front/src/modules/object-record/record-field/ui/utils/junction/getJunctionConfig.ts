import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';
import { hasJunctionTargetMorphId } from './hasJunctionTargetMorphId';

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

  let targetFields: FieldMetadataItem[] = [];
  let isMorphRelation = false;

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

  if (hasJunctionTargetFieldId(settings) === true) {
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === settings.junctionTargetFieldId,
    );

    if (!isDefined(targetField)) {
      return null;
    }

    isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

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
