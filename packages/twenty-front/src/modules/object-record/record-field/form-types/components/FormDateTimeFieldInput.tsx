import { FormDateishFieldInputBase } from '@/object-record/record-field/form-types/components/FormDateishFieldInputBase';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';

type FormDateTimeFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormDateTimeFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormDateTimeFieldInputProps) => {
  return (
    <FormDateishFieldInputBase
      mode="datetime"
      placeholder="mm/dd/yyyy hh:mm"
      label={label}
      defaultValue={defaultValue}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  );
};
