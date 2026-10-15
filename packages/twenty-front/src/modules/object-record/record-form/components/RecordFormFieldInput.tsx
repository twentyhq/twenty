import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormEmailsFieldInput } from '@/object-record/record-field/ui/form-types/components/FormEmailsFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { type JsonValue } from 'type-fest';

type RecordFormFieldInputProps = {
  field: Pick<FieldDefinition<FieldMetadata>, 'label' | 'metadata' | 'type'>;
  defaultValue: JsonValue;
  onChange: (value: JsonValue) => void;
  onClear?: () => void;
  readonly?: boolean;
  placeholder?: string;
  subFieldPlaceholders?: FormFieldInputSubFieldPlaceholders;
};

export const RecordFormFieldInput = ({
  field,
  defaultValue,
  onChange,
  onClear,
  readonly,
  placeholder,
  subFieldPlaceholders,
}: RecordFormFieldInputProps) => {
  if (isFieldLinks(field)) {
    return (
      <FormLinksFieldInput
        label={field.label}
        defaultValue={
          isFieldLinksValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        subFieldPlaceholders={subFieldPlaceholders}
        isPrimaryLinkUrlOnly
      />
    );
  }

  if (isFieldEmails(field)) {
    return (
      <FormEmailsFieldInput
        label={field.label}
        defaultValue={
          isFieldEmailsValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        subFieldPlaceholders={subFieldPlaceholders}
        isPrimaryEmailOnly
      />
    );
  }

  return (
    <FormFieldInput
      field={field}
      defaultValue={defaultValue}
      onChange={onChange}
      onClear={onClear}
      readonly={readonly}
      placeholder={placeholder}
      subFieldPlaceholders={subFieldPlaceholders}
      settings={getRecordFormFieldInputSettings(field.type)}
    />
  );
};
