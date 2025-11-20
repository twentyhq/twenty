import { OUTPUT_FIELD_TYPE_OPTIONS } from '@/ai/constants/OutputFieldTypeOptions';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { type AgentResponseFieldType } from 'twenty-shared/ai';

type WorkflowOutputFieldTypeSelectorProps = {
  value?: AgentResponseFieldType;
  onChange: (value: AgentResponseFieldType) => void;
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
