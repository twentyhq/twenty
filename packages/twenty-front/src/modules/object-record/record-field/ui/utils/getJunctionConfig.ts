import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  hasJunctionMorphId,
  hasJunctionTargetRelationFieldIds,
} from '@/object-record/record-field/ui/utils/isJunctionRelation';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type JunctionConfig = {
  junctionObjectMetadata: ObjectMetadataItem;
  // For morph relations: all fields matching the morphId
  morphFields?: FieldMetadataItem[];
  // For regular relations: single target field
  targetField?: FieldMetadataItem;
  targetObjectMetadata?: ObjectMetadataItem;
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
  const findSourceField = (
    excludeFieldId?: string,
  ): FieldMetadataItem | undefined => {
    if (!isDefined(sourceObjectMetadataId)) {
      return undefined;
    }
    return junctionObjectMetadata.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relation?.targetObjectMetadata.id === sourceObjectMetadataId &&
        field.id !== excludeFieldId,
    );
  };

  // Handle morph-based junction config (junctionMorphId)
  if (hasJunctionMorphId(settings)) {
    const morphFields = junctionObjectMetadata.fields.filter(
      (field) => field.morphId === settings.junctionMorphId,
    );

    if (morphFields.length === 0) {
      return null;
    }

    return {
      junctionObjectMetadata,
      morphFields,
      sourceField: findSourceField(),
      isMorphRelation: true,
    };
  }

  // Handle field ID-based junction config (junctionTargetRelationFieldIds)
  if (hasJunctionTargetRelationFieldIds(settings)) {
    const targetFieldId = settings.junctionTargetRelationFieldIds[0];
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === targetFieldId,
    );

    if (!isDefined(targetField)) {
      return null;
    }

    const isMorphRelation =
      targetField.type === FieldMetadataType.MORPH_RELATION;

    // For regular relations, validate and get the target object metadata
    if (!isMorphRelation && !isDefined(targetField.relation)) {
      return null;
    }

    let targetObjectMetadata: ObjectMetadataItem | undefined;

    if (!isMorphRelation && isDefined(targetField.relation)) {
      targetObjectMetadata = objectMetadataItems.find(
        (item) => item.id === targetField.relation?.targetObjectMetadata.id,
      );
    }

    return {
      junctionObjectMetadata,
      targetField,
      targetObjectMetadata,
      sourceField: findSourceField(targetFieldId),
      isMorphRelation,
    };
  }

  return null;
};
