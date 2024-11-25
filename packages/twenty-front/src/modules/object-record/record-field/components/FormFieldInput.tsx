import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { JsonValue } from 'type-fest';

type FormFieldInputProps = {
  field: FieldMetadataItem;
  defaultValue: JsonValue;
  onPersist: (value: JsonValue) => void;
};

export const FormFieldInput = ({
  field,
  defaultValue,
  onPersist,
}: FormFieldInputProps) => {
  return isFieldNumber(field) ? (
    <FormNumberFieldInput
      key={field.id}
      label={field.label}
      defaultValue={defaultValue as string | number | undefined}
      onPersist={onPersist}
      placeholder={field.label}
    />
  ) : isFieldBoolean(field) ? (
    <FormBooleanFieldInput
      key={field.id}
      label={field.label}
      defaultValue={defaultValue as string | boolean | undefined}
      onPersist={onPersist}
    />
  ) : isFieldText(field) ? (
    <FormTextFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      placeholder={field.label}
    />
  ) : null;
};
