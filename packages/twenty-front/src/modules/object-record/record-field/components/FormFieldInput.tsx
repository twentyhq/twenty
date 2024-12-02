import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { JsonValue } from 'type-fest';

type FormFieldInputProps = {
  field: FieldDefinition<FieldMetadata>;
  defaultValue: JsonValue;
  onPersist: (value: JsonValue) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormFieldInput = ({
  field,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormFieldInputProps) => {
  return isFieldNumber(field) ? (
    <FormNumberFieldInput
      label={field.label}
      defaultValue={defaultValue as string | number | undefined}
      onPersist={onPersist}
      placeholder={field.label}
      VariablePicker={VariablePicker}
    />
  ) : isFieldBoolean(field) ? (
    <FormBooleanFieldInput
      label={field.label}
      defaultValue={defaultValue as string | boolean | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : isFieldText(field) ? (
    <FormTextFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      placeholder={field.label}
      VariablePicker={VariablePicker}
    />
  ) : isFieldSelect(field) ? (
    <FormSelectFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      field={field}
      VariablePicker={VariablePicker}
    />
  ) : null;
};
