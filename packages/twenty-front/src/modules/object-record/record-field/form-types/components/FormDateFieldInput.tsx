import { FormDateTimeFieldInput } from '@/object-record/record-field/form-types/components/FormDateTimeFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';

type FormDateFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormDateFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
  readonly,
}: FormDateFieldInputProps) => {
  return (
    <FormDateTimeFieldInput
      dateOnly
      label={label}
      defaultValue={defaultValue}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  );
};
