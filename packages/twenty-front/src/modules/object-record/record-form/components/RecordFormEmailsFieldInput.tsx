import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { t } from '@lingui/core/macro';

type RecordFormEmailsFieldInputProps = {
  label?: string;
  defaultValue?: FieldEmailsValue;
  onChange: (value: FieldEmailsValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormEmailsFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormEmailsFieldInputProps) => {
  const handlePrimaryEmailChange = (primaryEmail: string) =>
    onChange({
      primaryEmail,
      additionalEmails: defaultValue?.additionalEmails ?? [],
    });

  return (
    <FormTextFieldInput
      label={label}
      defaultValue={defaultValue?.primaryEmail}
      onChange={handlePrimaryEmailChange}
      placeholder={placeholder ?? t`Email`}
      readonly={readonly}
    />
  );
};
