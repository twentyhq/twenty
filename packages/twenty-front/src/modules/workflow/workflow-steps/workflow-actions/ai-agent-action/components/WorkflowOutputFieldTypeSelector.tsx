import { Select } from '@/ui/input/components/Select';
import {
  OUTPUT_FIELD_TYPE_OPTIONS,
  WorkflowOutputFieldType,
} from '../constants/output-field-type-options';

type WorkflowOutputFieldTypeSelectorProps = {
  value: WorkflowOutputFieldType;
  onChange: (value: WorkflowOutputFieldType) => void;
  disabled?: boolean;
};

export const WorkflowOutputFieldTypeSelector = ({
  value,
  onChange,
  disabled,
}: WorkflowOutputFieldTypeSelectorProps) => {
  return (
    <Select
      dropdownId="output-field-type-selector"
      label="Field Type"
      options={OUTPUT_FIELD_TYPE_OPTIONS}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
