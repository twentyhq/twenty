import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';

type FormFieldInputProps = {
  recordFieldInputdId: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
};

export const FormFieldInput = ({
  recordFieldInputdId,
  label,
  onChange,
  value,
}: FormFieldInputProps) => {
  return (
    <VariableTagInput
      inputId={recordFieldInputdId}
      label={label}
      placeholder="Enter value (use {{variable}} for dynamic content)"
      value={value}
      onChange={onChange}
    />
  );
};
