import { FormAddressFieldInput } from '@/object-record/record-field/form-types/components/FormAddressFieldInput';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormCurrencyFieldInput } from '@/object-record/record-field/form-types/components/FormCurrencyFieldInput';
import { FormDateFieldInput } from '@/object-record/record-field/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/form-types/components/FormDateTimeFieldInput';
import { FormEmailsFieldInput } from '@/object-record/record-field/form-types/components/FormEmailsFieldInput';
import { FormFullNameFieldInput } from '@/object-record/record-field/form-types/components/FormFullNameFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/form-types/components/FormLinksFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormPhoneFieldInput } from '@/object-record/record-field/form-types/components/FormPhoneFieldInput';
import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormRichTextV2FieldInput } from '@/object-record/record-field/form-types/components/FormRichTextV2FieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { FormUuidFieldInput } from '@/object-record/record-field/form-types/components/FormUuidFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldAddressValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldMetadata,
  FieldMultiSelectValue,
  FieldPhonesValue,
  FieldRelationToOneValue,
  FieldRelationValue,
  FieldRichTextV2Value,
  FormFieldCurrencyValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { isFieldRichTextV2 } from '@/object-record/record-field/types/guards/isFieldRichTextV2';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';
import { FieldMetadataType } from 'twenty-shared/types';
import { JsonValue } from 'type-fest';

type FormFieldInputProps = {
  field: Pick<FieldDefinition<FieldMetadata>, 'label' | 'metadata' | 'type'>;
  defaultValue: JsonValue;
  onChange: (value: JsonValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  error?: string;
  onError?: (error: string | undefined) => void;
};

export const FormFieldInput = ({
  field,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  error,
  onError,
}: FormFieldInputProps) => {
  return isFieldNumber(field) || field.type === FieldMetadataType.NUMERIC ? (
    <FormNumberFieldInput
      label={field.label}
      defaultValue={defaultValue as string | number | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
      error={error}
      onError={onError}
    />
  ) : isFieldBoolean(field) ? (
    <FormBooleanFieldInput
      label={field.label}
      defaultValue={defaultValue as string | boolean | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldText(field) ? (
    <FormTextFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldSelect(field) ? (
    <FormSelectFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      options={field.metadata?.options}
      readonly={readonly}
    />
  ) : isFieldFullName(field) ? (
    <FormFullNameFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldFullNameValue | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldAddress(field) ? (
    <FormAddressFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldAddressValue | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldLinks(field) ? (
    <FormLinksFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldLinksValue | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldEmails(field) ? (
    <FormEmailsFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldEmailsValue | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldPhones(field) ? (
    <FormPhoneFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldPhonesValue | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldDate(field) ? (
    <FormDateFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldDateTime(field) ? (
    <FormDateTimeFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldMultiSelect(field) ? (
    <FormMultiSelectFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldMultiSelectValue | string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      options={field.metadata?.options}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldRawJson(field) ? (
    <FormRawJsonFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldUuid(field) ? (
    <FormUuidFieldInput
      label={field.label}
      defaultValue={defaultValue as string | null | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldCurrency(field) ? (
    <FormCurrencyFieldInput
      label={field.label}
      defaultValue={defaultValue as FormFieldCurrencyValue | null}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : isFieldRichTextV2(field) ? (
    <FormRichTextV2FieldInput
      label={field.label}
      defaultValue={defaultValue as FieldRichTextV2Value | undefined}
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldRelationToOneObject(field) ? (
    <FormRelationToOneFieldInput
      label={field.label}
      objectNameSingular={field.metadata.relationObjectMetadataNameSingular}
      defaultValue={
        defaultValue as FieldRelationValue<FieldRelationToOneValue> | string
      }
      onChange={onChange}
      VariablePicker={VariablePicker}
      readonly={readonly}
    />
  ) : null;
};
