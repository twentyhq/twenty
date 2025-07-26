import { Select } from '@/ui/input/components/Select';
import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { t } from '@lingui/core/macro';
import { OUTPUT_FIELD_TYPE_OPTIONS } from '@/ai/constants/output-field-type-options';

type WorkflowOutputFieldTypeSelectorProps = {
  value?: InputSchemaPropertyType;
  onChange: (value: InputSchemaPropertyType) => void;
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
      options={OUTPUT_FIELD_TYPE_OPTIONS.map((option) => ({
        ...option,
        label: t(option.label),
      }))}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
