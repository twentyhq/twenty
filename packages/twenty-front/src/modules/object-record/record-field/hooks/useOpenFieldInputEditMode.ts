import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';

export const useOpenFieldInputEditMode = () => {
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();

  const openFieldInput = (
    fieldDefinition: FieldDefinition<FieldMetadata>,
    recordId: string,
  ) => {
    if (isFieldRelationToOneObject(fieldDefinition)) {
      openRelationToOneFieldInput({
        fieldName: fieldDefinition.metadata.fieldName,
        recordId: recordId,
      });
    }
  };

  return {
    openFieldInput: openFieldInput,
    closeFieldInput: () => {},
  };
};
