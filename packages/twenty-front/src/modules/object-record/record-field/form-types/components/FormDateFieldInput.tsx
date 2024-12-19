import { FormDateishFieldInputBase } from '@/object-record/record-field/form-types/components/FormDateishFieldInputBase';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';

type FormDateFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormDateFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormDateFieldInputProps) => {
  return (
    <FormDateishFieldInputBase
      mode="date"
      placeholder="mm/dd/yyyy"
      label={label}
      defaultValue={defaultValue}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  );
};
