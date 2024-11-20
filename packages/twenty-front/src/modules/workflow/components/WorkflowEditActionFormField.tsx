import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';

type WorkflowEditActionFormFieldProps = {
  defaultValue: string;
};

export const WorkflowEditActionFormField = ({
  defaultValue,
}: WorkflowEditActionFormFieldProps) => {
  return (
    <FormNumberFieldInput
      defaultValue={defaultValue}
      placeholder="Placeholder"
      onPersist={(value) => {
        console.log('save value to database', value);
      }}
    />
  );
};
