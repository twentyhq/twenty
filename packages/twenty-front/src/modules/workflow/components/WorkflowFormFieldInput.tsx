import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { WorkflowFormBooleanFieldInput } from '@/workflow/components/WorkflowFormBooleanFieldInput';
import { WorkflowFormNumberFieldInput } from '@/workflow/components/WorkflowFormNumberFieldInput';
import { WorkflowFormTextFieldInput } from '@/workflow/components/WorkflowFormTextFieldInput';
import { JsonValue } from 'type-fest';

type WorkflowFormFieldInputProps = {
  field: FieldMetadataItem;
  defaultValue: JsonValue;
  onPersist: (value: JsonValue) => void;
};

export const WorkflowFormFieldInput = ({
  field,
  defaultValue,
  onPersist,
}: WorkflowFormFieldInputProps) => {
  return isFieldNumber(field) ? (
    <WorkflowFormNumberFieldInput
      key={field.id}
      label={field.label}
      defaultValue={defaultValue as string | number | undefined}
      onPersist={onPersist}
      placeholder={field.label}
    />
  ) : isFieldBoolean(field) ? (
    <WorkflowFormBooleanFieldInput
      key={field.id}
      label={field.label}
      defaultValue={defaultValue as string | boolean | undefined}
      onPersist={onPersist}
    />
  ) : isFieldText(field) ? (
    <WorkflowFormTextFieldInput
      label={field.label}
      defaultValue={defaultValue as string | undefined}
      onPersist={onPersist}
      placeholder={field.label}
    />
  ) : null;
};
