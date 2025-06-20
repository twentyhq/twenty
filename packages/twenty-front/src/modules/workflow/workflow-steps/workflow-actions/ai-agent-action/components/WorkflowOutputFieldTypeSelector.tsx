import { Select } from '@/ui/input/components/Select';
import {
  OUTPUT_FIELD_TYPE_OPTIONS,
  WorkflowOutputFieldType,
} from '../constants/output-field-type-options';

type WorkflowOutputFieldTypeSelectorProps = {
  value: WorkflowOutputFieldType;
  onChange: (value: WorkflowOutputFieldType) => void;
  disabled?: boolean;
  dropdownId: string;
};

export const WorkflowOutputFieldTypeSelector = ({
  value,
  onChange,
  disabled,
  dropdownId,
}: WorkflowOutputFieldTypeSelectorProps) => {
  return (
    <Select
      dropdownId={dropdownId}
      label="Field Type"
      options={OUTPUT_FIELD_TYPE_OPTIONS}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
