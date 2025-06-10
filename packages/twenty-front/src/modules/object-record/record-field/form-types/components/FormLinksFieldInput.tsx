import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldLinksDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';

type FormLinksFieldInputProps = {
  label?: string;
  defaultValue?: FieldLinksValue;
  onChange: (value: FieldLinksValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
};

export const FormLinksFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  placeholder,
}: FormLinksFieldInputProps) => {
  const handleChange =
    (field: keyof FieldLinksDraftValue) => (updatedLinksPart: string) => {
      const updatedLinks = {
        primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
        primaryLinkUrl: defaultValue?.primaryLinkUrl ?? '',
        [field]: updatedLinksPart,
      };
      // We need to validate the links and display an error message if the links are not valid
      onChange(updatedLinks);
    };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label="Primary Link Label"
          defaultValue={defaultValue?.primaryLinkLabel}
          onChange={handleChange('primaryLinkLabel')}
          placeholder={placeholder ?? 'Primary Link Label'}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormTextFieldInput
          label="Primary Link URL"
          defaultValue={defaultValue?.primaryLinkUrl}
          onChange={handleChange('primaryLinkUrl')}
          placeholder={placeholder ?? 'Primary Link URL'}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
