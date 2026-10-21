import { FormEmailsFieldInput } from '@/object-record/record-field/ui/form-types/components/FormEmailsFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { FormRecordRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput';
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
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelectValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldRichTextValue } from '@/object-record/record-field/ui/types/guards/isFieldRichTextValue';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { RecordFormAddressFieldInput } from '@/object-record/record-form/components/RecordFormAddressFieldInput';
import { RecordFormArrayFieldInput } from '@/object-record/record-form/components/RecordFormArrayFieldInput';
import { RecordFormBooleanFieldInput } from '@/object-record/record-form/components/RecordFormBooleanFieldInput';
import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { RecordFormDateFieldInput } from '@/object-record/record-form/components/RecordFormDateFieldInput';
import { RecordFormDateTimeFieldInput } from '@/object-record/record-form/components/RecordFormDateTimeFieldInput';
import { RecordFormFullNameFieldInput } from '@/object-record/record-form/components/RecordFormFullNameFieldInput';
import {
  RecordFormMorphRelationFieldInput,
  type RecordFormMorphRelationValue,
} from '@/object-record/record-form/components/RecordFormMorphRelationFieldInput';
import { RecordFormMultiSelectFieldInput } from '@/object-record/record-form/components/RecordFormMultiSelectFieldInput';
import { RecordFormNumberFieldInput } from '@/object-record/record-form/components/RecordFormNumberFieldInput';
import { RecordFormPhoneFieldInput } from '@/object-record/record-form/components/RecordFormPhoneFieldInput';
import { RecordFormRawJsonFieldInput } from '@/object-record/record-form/components/RecordFormRawJsonFieldInput';
import { RecordFormRelationFieldInput } from '@/object-record/record-form/components/RecordFormRelationFieldInput';
import { RecordFormSelectFieldInput } from '@/object-record/record-form/components/RecordFormSelectFieldInput';
import { RecordFormTextFieldInput } from '@/object-record/record-form/components/RecordFormTextFieldInput';
import { RecordFormUuidFieldInput } from '@/object-record/record-form/components/RecordFormUuidFieldInput';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';
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

// The form draft holds a relation either as the record id or as the record itself.
const getRelationRecordId = (value: JsonValue): string | null | undefined =>
  value === null
    ? null
    : isString(value)
      ? value
      : isPlainObject(value) && isString(value.id)
        ? value.id
        : undefined;

const getMorphRelationValue = (
  value: JsonValue,
): RecordFormMorphRelationValue | null | undefined =>
  value === null
    ? null
    : isPlainObject(value) &&
        isString(value.id) &&
        isString(value.targetObjectMetadataId)
      ? { id: value.id, targetObjectMetadataId: value.targetObjectMetadataId }
      : undefined;

export const RecordFormFieldInput = ({
  field,
  defaultValue,
  onChange,
  onClear,
  readonly,
  placeholder,
  subFieldPlaceholders,
}: RecordFormFieldInputProps) => {
  if (isFieldText(field)) {
    return (
      <RecordFormTextFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
      />
    );
  }

  if (isFieldNumber(field)) {
    return (
      <RecordFormNumberFieldInput
        field={field}
        defaultValue={
          isFieldNumberValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
      />
    );
  }

  if (isFieldUuid(field)) {
    return (
      <RecordFormUuidFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
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

  if (isFieldSelect(field)) {
    return (
      <RecordFormSelectFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        options={field.metadata.options}
        readonly={readonly}
        isNullable={field.metadata.isNullable}
      />
    );
  }

  if (isFieldMultiSelect(field)) {
    return (
      <RecordFormMultiSelectFieldInput
        label={field.label}
        defaultValue={
          isFieldMultiSelectValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        options={field.metadata.options}
        readonly={readonly}
        placeholder={placeholder}
      />
    );
  }

  if (isFieldDate(field)) {
    return (
      <RecordFormDateFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        readonly={readonly}
      />
    );
  }

  if (isFieldDateTime(field)) {
    return (
      <RecordFormDateTimeFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        readonly={readonly}
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
        subFieldPlaceholders={subFieldPlaceholders}
      />
    );
  }

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

  if (isFieldArray(field)) {
    return (
      <RecordFormArrayFieldInput
        label={field.label}
        defaultValue={
          isFieldArrayValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
        maxItemCount={field.metadata.settings?.maxNumberOfValues}
      />
    );
  }

  if (isFieldRawJson(field)) {
    return (
      <RecordFormRawJsonFieldInput
        label={field.label}
        defaultValue={isString(defaultValue) ? defaultValue : undefined}
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
      />
    );
  }

  if (isFieldRichText(field)) {
    return (
      <FormRecordRichTextFieldInput
        label={field.label}
        defaultValue={
          isFieldRichTextValue(defaultValue) ? defaultValue : undefined
        }
        onChange={onChange}
        readonly={readonly}
        placeholder={placeholder}
      />
    );
  }

  if (isFieldRelationManyToOne(field)) {
    return (
      <RecordFormRelationFieldInput
        label={field.label}
        objectNameSingulars={[
          field.metadata.relationObjectMetadataNameSingular,
        ]}
        defaultValue={getRelationRecordId(defaultValue)}
        onChange={onChange}
        onClear={onClear}
        readonly={readonly}
      />
    );
  }

  return isFieldMorphRelationManyToOne(field) ? (
    <RecordFormMorphRelationFieldInput
      label={field.label}
      morphRelations={field.metadata.morphRelations}
      defaultValue={getMorphRelationValue(defaultValue)}
      onChange={onChange}
      onClear={onClear}
      readonly={readonly}
    />
  ) : null;
};
