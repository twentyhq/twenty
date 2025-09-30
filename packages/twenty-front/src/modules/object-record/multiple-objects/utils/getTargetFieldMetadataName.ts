import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMorphRelationMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

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
    return fieldDefinition.metadata.targetFieldMetadataName;
  } else {
    return fieldDefinition.metadata.morphRelations.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular === objectNameSingular,
    )?.sourceFieldMetadata.name;
  }
};
