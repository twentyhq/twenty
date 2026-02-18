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

  if (!isMorphRelation && !isDefined(targetField.relation)) {
    return null;
  }

  return {
    junctionObjectMetadata,
    targetFields: [targetField],
    sourceField: findSourceField(settings.junctionTargetFieldId),
    isMorphRelation,
  };
};
