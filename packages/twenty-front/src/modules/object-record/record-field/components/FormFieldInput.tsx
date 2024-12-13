import { FormAddressFieldInput } from '@/object-record/record-field/form-types/components/FormAddressFieldInput';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormEmailsFieldInput } from '@/object-record/record-field/form-types/components/FormEmailsFieldInput';
import { FormFullNameFieldInput } from '@/object-record/record-field/form-types/components/FormFullNameFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/form-types/components/FormLinksFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldAddressValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { JsonValue } from 'type-fest';

type FormFieldInputProps = {
  field: FieldDefinition<FieldMetadata>;
  defaultValue: JsonValue;
  onPersist: (value: JsonValue) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormFieldInput = ({
  field,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormFieldInputProps) => {
  return isFieldNumber(field) ? (
    <FormNumberFieldInput
      label={field.label}
      defaultValue={defaultValue as string | number | undefined}
      onPersist={onPersist}
      placeholder={field.label}
      VariablePicker={VariablePicker}
    />
  ) : isFieldBoolean(field) ? (
    <FormBooleanFieldInput
      label={field.label}
      defaultValue={defaultValue as string | boolean | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : isFieldText(field) ? (
    <FormTextFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      placeholder={field.label}
      VariablePicker={VariablePicker}
    />
  ) : isFieldSelect(field) ? (
    <FormSelectFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
      options={field.metadata.options}
      clearLabel={field.label}
    />
  ) : isFieldFullName(field) ? (
    <FormFullNameFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldFullNameValue | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : isFieldAddress(field) ? (
    <FormAddressFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldAddressValue | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : isFieldLinks(field) ? (
    <FormLinksFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldLinksValue | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : isFieldEmails(field) ? (
    <FormEmailsFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldEmailsValue | undefined}
      onPersist={onPersist}
      VariablePicker={VariablePicker}
    />
  ) : null;
};
