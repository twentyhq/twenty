import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormEmailsFieldInput } from '@/object-record/record-field/ui/form-types/components/FormEmailsFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '@/object-record/record-field/ui/types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { RecordFormBooleanFieldInput } from '@/object-record/record-form/components/RecordFormBooleanFieldInput';
import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { RecordFormPercentageFieldInput } from '@/object-record/record-form/components/RecordFormPercentageFieldInput';
import { RecordFormPhoneFieldInput } from '@/object-record/record-form/components/RecordFormPhoneFieldInput';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { isNonEmptyString } from '@sniptt/guards';
import { type JsonValue } from 'type-fest';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type RecordFormFieldInputProps = {
  field: Pick<
    FieldDefinition<FieldMetadata>,
    'label' | 'metadata' | 'type' | 'defaultValue'
  >;
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

  if (isFieldCurrency(field)) {
    return (
      <RecordFormCurrencyFieldInput
        label={field.label}
        defaultValue={
          isFieldCurrencyValue(defaultValue) ? defaultValue : undefined
        }
        defaultCurrencyCode={
          getRecordFormCurrencyFieldDefaultValue(field)?.currencyCode
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={subFieldPlaceholders?.amountMicros}
      />
    );
  }

  if (isFieldNumber(field) && field.metadata.settings?.type === 'percentage') {
    return (
      <RecordFormPercentageFieldInput
        field={field}
        defaultValue={
          isFieldNumberValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
      />
    );
  }

  if (isFieldBoolean(field)) {
    return (
      <RecordFormBooleanFieldInput
        label={field.label}
        defaultValue={
          isFieldBooleanValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
      />
    );
  }

  if (isFieldPhones(field)) {
    const defaultCountryCode = field.defaultValue?.primaryPhoneCountryCode;

    return (
      <RecordFormPhoneFieldInput
        label={field.label}
        defaultValue={
          isFieldPhonesValue(defaultValue) ? defaultValue : undefined
        }
        defaultCountryCode={
          isNonEmptyString(defaultCountryCode)
            ? stripSimpleQuotesFromString(defaultCountryCode)
            : undefined
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={subFieldPlaceholders?.primaryPhoneNumber}
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
    />
  );
};
