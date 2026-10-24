import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormEmailsFieldInput } from '@/object-record/record-field/ui/form-types/components/FormEmailsFieldInput';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '@/object-record/record-field/ui/types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFiles } from '@/object-record/record-field/ui/types/guards/isFieldFiles';
import { isFieldFilesValue } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { RecordFormAddressFieldInput } from '@/object-record/record-form/components/RecordFormAddressFieldInput';
import { RecordFormArrayFieldInput } from '@/object-record/record-form/components/RecordFormArrayFieldInput';
import { RecordFormBooleanFieldInput } from '@/object-record/record-form/components/RecordFormBooleanFieldInput';
import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { RecordFormEmailsFieldInput } from '@/object-record/record-form/components/RecordFormEmailsFieldInput';
import { RecordFormPercentageFieldInput } from '@/object-record/record-form/components/RecordFormPercentageFieldInput';
import { RecordFormFilesFieldInput } from '@/object-record/record-form/components/RecordFormFilesFieldInput';
import { RecordFormFullNameFieldInput } from '@/object-record/record-form/components/RecordFormFullNameFieldInput';
import { RecordFormLinksFieldInput } from '@/object-record/record-form/components/RecordFormLinksFieldInput';
import { RecordFormPhonesFieldInput } from '@/object-record/record-form/components/RecordFormPhonesFieldInput';
import { RecordFormTextAreaFieldInput } from '@/object-record/record-form/components/RecordFormTextAreaFieldInput';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { getLinksVariant } from '@/object-record/spreadsheet-import/utils/getLinksVariant';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidCountryCode } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type RecordFormFieldInputProps = {
  field: Pick<
    FieldDefinition<FieldMetadata>,
    'fieldMetadataId' | 'label' | 'metadata' | 'type' | 'defaultValue'
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
  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  if (isFieldLinks(field) && !readonly) {
    return (
      <RecordFormLinksFieldInput
        label={field.label}
        defaultValue={
          isFieldLinksValue(defaultValue) ? defaultValue : undefined
        }
        isDomainField={
          getLinksVariant({
            type: FieldMetadataType.LINKS,
            settings: field.metadata.settings,
          }) === 'domain'
        }
        maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
        placeholder={subFieldPlaceholders?.primaryLinkUrl}
        onChange={onChange}
      />
    );
  }

  if (isFieldPhones(field) && !readonly) {
    const defaultCountryCode = stripSimpleQuotesFromString(
      field.defaultValue?.primaryPhoneCountryCode ?? '',
    );

    return (
      <RecordFormPhonesFieldInput
        label={field.label}
        defaultValue={
          isFieldPhonesValue(defaultValue) ? defaultValue : undefined
        }
        defaultCountry={
          isValidCountryCode(defaultCountryCode)
            ? defaultCountryCode
            : undefined
        }
        maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
        placeholder={subFieldPlaceholders?.primaryPhoneNumber}
        onChange={onChange}
      />
    );
  }

  if (isFieldFiles(field) && !readonly) {
    return (
      <RecordFormFilesFieldInput
        label={field.label}
        defaultValue={
          isFieldFilesValue(defaultValue) ? defaultValue : undefined
        }
        fieldMetadataId={field.fieldMetadataId}
        maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
        onChange={onChange}
      />
    );
  }

  if (isFieldAddress(field) && !readonly) {
    const settings = field.metadata.settings;

    return (
      <RecordFormAddressFieldInput
        label={field.label}
        defaultValue={
          isFieldAddressValue(defaultValue) ? defaultValue : undefined
        }
        subFields={
          isDefined(settings) && 'subFields' in settings
            ? settings.subFields
            : undefined
        }
        subFieldPlaceholders={subFieldPlaceholders}
        onChange={onChange}
      />
    );
  }

  if (isFieldFullName(field) && !readonly) {
    return (
      <RecordFormFullNameFieldInput
        label={field.label}
        defaultValue={
          isFieldFullNameValue(defaultValue) ? defaultValue : undefined
        }
        firstNamePlaceholder={subFieldPlaceholders?.firstName}
        lastNamePlaceholder={subFieldPlaceholders?.lastName}
        onChange={onChange}
      />
    );
  }

  if (
    isFieldText(field) &&
    !readonly &&
    (field.metadata.settings?.displayedMaxRows ?? 0) > 1
  ) {
    return (
      <RecordFormTextAreaFieldInput
        label={field.label}
        defaultValue={isFieldTextValue(defaultValue) ? defaultValue : undefined}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  }

  if (isFieldEmails(field) && !readonly) {
    return (
      <RecordFormEmailsFieldInput
        label={field.label}
        defaultValue={
          isFieldEmailsValue(defaultValue) ? defaultValue : undefined
        }
        maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
        placeholder={subFieldPlaceholders?.primaryEmail}
        onChange={onChange}
      />
    );
  }

  if (isFieldArray(field) && !readonly) {
    return (
      <RecordFormArrayFieldInput
        label={field.label}
        defaultValue={
          isFieldArrayValue(defaultValue) ? defaultValue : undefined
        }
        maxNumberOfValues={field.metadata.settings?.maxNumberOfValues}
        onChange={onChange}
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

  return (
    <FormFieldInput
      field={field}
      defaultValue={defaultValue}
      onChange={onChange}
      onClear={onClear}
      onError={(error) =>
        setRecordFieldInputIsFieldInError(isNonEmptyString(error))
      }
      readonly={readonly}
      placeholder={placeholder}
      subFieldPlaceholders={subFieldPlaceholders}
    />
  );
};
