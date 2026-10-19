import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { ArrayMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/ArrayMultiItemInput';
import { EmailsMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/EmailsMultiItemInput';
import { LinksMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksMultiItemInput';
import { PhonesMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesMultiItemInput';
import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '@/object-record/record-field/ui/types/guards/isFieldBooleanValue';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { RecordFormBooleanFieldInput } from '@/object-record/record-form/components/RecordFormBooleanFieldInput';
import { RecordFormAddressFieldInput } from '@/object-record/record-form/components/RecordFormAddressFieldInput';
import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { RecordFormFullNameFieldInput } from '@/object-record/record-form/components/RecordFormFullNameFieldInput';
import { RecordFormMultiItemFieldInputContainer } from '@/object-record/record-form/components/RecordFormMultiItemFieldInputContainer';
import { RecordFormPercentageFieldInput } from '@/object-record/record-form/components/RecordFormPercentageFieldInput';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { isValidCountryCode } from 'twenty-shared/utils';
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
      <RecordFormMultiItemFieldInputContainer label={field.label}>
        <LinksMultiItemInput
          variant="inline"
          value={isFieldLinksValue(defaultValue) ? defaultValue : undefined}
          fieldName={field.metadata.fieldName}
          settings={field.metadata.settings}
          placeholder={subFieldPlaceholders?.primaryLinkUrl}
          onChange={onChange}
        />
      </RecordFormMultiItemFieldInputContainer>
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

  if (isFieldEmails(field)) {
    return (
      <RecordFormMultiItemFieldInputContainer label={field.label}>
        <EmailsMultiItemInput
          variant="inline"
          value={isFieldEmailsValue(defaultValue) ? defaultValue : undefined}
          fieldName={field.metadata.fieldName}
          maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
          placeholder={subFieldPlaceholders?.primaryEmail}
          onChange={onChange}
        />
      </RecordFormMultiItemFieldInputContainer>
    );
  }

  if (isFieldArray(field)) {
    return (
      <RecordFormMultiItemFieldInputContainer label={field.label}>
        <ArrayMultiItemInput
          variant="inline"
          value={isFieldArrayValue(defaultValue) ? defaultValue : undefined}
          fieldName={field.metadata.fieldName}
          maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
          onChange={onChange}
        />
      </RecordFormMultiItemFieldInputContainer>
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

  if (isFieldFullName(field)) {
    return (
      <RecordFormFullNameFieldInput
        label={field.label}
        defaultValue={
          isFieldFullNameValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        subFieldPlaceholders={subFieldPlaceholders}
      />
    );
  }

  if (isFieldAddress(field)) {
    return (
      <RecordFormAddressFieldInput
        label={field.label}
        defaultValue={
          isFieldAddressValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={subFieldPlaceholders?.addressStreet1}
        subFields={field.metadata.settings?.subFields}
      />
    );
  }

  if (isFieldPhones(field)) {
    const defaultCountryCode = stripSimpleQuotesFromString(
      field.defaultValue?.primaryPhoneCountryCode ?? '',
    );

    return (
      <RecordFormMultiItemFieldInputContainer label={field.label}>
        <PhonesMultiItemInput
          variant="inline"
          value={isFieldPhonesValue(defaultValue) ? defaultValue : undefined}
          fieldName={field.metadata.fieldName}
          defaultCountry={
            isValidCountryCode(defaultCountryCode)
              ? defaultCountryCode
              : undefined
          }
          maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
          placeholder={subFieldPlaceholders?.primaryPhoneNumber}
          onChange={onChange}
        />
      </RecordFormMultiItemFieldInputContainer>
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
