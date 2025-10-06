import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMorphRelationMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const getTargetFieldMetadataName = ({
  fieldDefinition,
  objectNameSingular,
}: {
  fieldDefinition:
    | FieldDefinition<FieldMorphRelationMetadata>
    | FieldDefinition<FieldRelationMetadata>;
  objectNameSingular: string;
}) => {
  if (isFieldRelation(fieldDefinition)) {
    return fieldDefinition.metadata.fieldName;
  } else {
    const morphRelation = fieldDefinition.metadata.morphRelations.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular === objectNameSingular,
    );
    if (!morphRelation) {
      return undefined;
    }
    return computeMorphRelationFieldName({
      fieldName: fieldDefinition.metadata.fieldName,
      relationType: fieldDefinition.metadata.relationType,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });
  }
};
