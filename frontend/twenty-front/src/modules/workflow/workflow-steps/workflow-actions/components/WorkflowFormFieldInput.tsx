import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

type WorkflowFormFieldInputProps = {
  fieldMetadataId: string;
  defaultValue: JsonValue;
  readonly: boolean;
  onChange: (value: JsonValue) => void;
  VariablePicker?: VariablePickerComponent;
};

export const WorkflowFormFieldInput = ({
  fieldMetadataId,
  defaultValue,
  readonly,
  onChange,
  VariablePicker,
}: WorkflowFormFieldInputProps) => {
  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemById(fieldMetadataId);

  if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: fieldMetadataItem,
    objectMetadataItem,
  });

  return (
    <FormFieldInput
      key={fieldDefinition.metadata.fieldName}
      defaultValue={defaultValue}
      field={fieldDefinition}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  );
};
