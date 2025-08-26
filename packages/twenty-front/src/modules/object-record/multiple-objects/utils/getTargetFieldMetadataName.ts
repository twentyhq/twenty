import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

export const getTargetFieldMetadataName = ({
  fieldDefinition,
  objectNameSingular,
}: {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  objectNameSingular: string;
}) => {
  let targetFieldName = undefined;
  if (isFieldRelation(fieldDefinition)) {
    targetFieldName = fieldDefinition.metadata.targetFieldMetadataName;
  }
  if (isFieldMorphRelation(fieldDefinition)) {
    targetFieldName = fieldDefinition.metadata.morphRelations.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular === objectNameSingular,
    )?.targetFieldMetadata.name;
  }

  return targetFieldName;
};
