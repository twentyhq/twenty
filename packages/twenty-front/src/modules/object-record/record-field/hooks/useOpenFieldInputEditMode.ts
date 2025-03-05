import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { isDefined } from 'twenty-shared';

export const useOpenFieldInputEditMode = () => {
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();
  const { openRelationFromManyFieldInput } =
    useOpenRelationFromManyFieldInput();

  const openFieldInput = ({
    fieldDefinition,
    recordId,
  }: {
    fieldDefinition: FieldDefinition<FieldMetadata>;
    recordId: string;
  }) => {
    if (isFieldRelationToOneObject(fieldDefinition)) {
      openRelationToOneFieldInput({
        fieldName: fieldDefinition.metadata.fieldName,
        recordId: recordId,
      });
    }

    if (isFieldRelationFromManyObjects(fieldDefinition)) {
      if (
        isDefined(fieldDefinition.metadata.relationObjectMetadataNameSingular)
      ) {
        openRelationFromManyFieldInput({
          fieldName: fieldDefinition.metadata.fieldName,
          objectNameSingular:
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          recordId: recordId,
        });
      }
    }
  };

  return {
    openFieldInput: openFieldInput,
    closeFieldInput: () => {},
  };
};
