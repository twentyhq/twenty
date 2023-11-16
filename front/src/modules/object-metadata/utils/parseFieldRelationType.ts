import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDefinitionRelationType } from '@/ui/object/field/types/FieldDefinition';
import { isDefined } from '~/utils/isDefined';

export const parseFieldRelationType = (
  field: FieldMetadataItem | undefined,
): FieldDefinitionRelationType | undefined => {
  if (field && field.type === 'RELATION') {
    if (
      isDefined(field.fromRelationMetadata) &&
      field.fromRelationMetadata.relationType === 'ONE_TO_MANY'
    ) {
      return 'FROM_NAMY_OBJECTS';
    } else if (
      isDefined(field.toRelationMetadata) &&
      field.toRelationMetadata.relationType === 'ONE_TO_MANY'
    ) {
      return 'TO_ONE_OBJECT';
    } else if (
      isDefined(field.fromRelationMetadata) &&
      field.fromRelationMetadata.relationType === 'MANY_TO_MANY'
    ) {
      return 'FROM_NAMY_OBJECTS';
    } else if (
      isDefined(field.toRelationMetadata) &&
      field.toRelationMetadata.relationType === 'MANY_TO_MANY'
    ) {
      return 'TO_MANY_OBJECTS';
    }

    throw new Error(
      `Cannot determine field relation type for field : ${JSON.stringify(
        field,
      )}.`,
    );
  } else {
    return undefined;
  }
};
