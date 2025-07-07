import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { StepFilter, StepOperand } from 'twenty-shared/src/types';

type WorkflowStepFilterOperandSelectProps = {
  stepFilter: StepFilter;
};

const STEP_OPERAND_OPTIONS = [
  { value: StepOperand.EQ, label: 'Equals' },
  { value: StepOperand.NE, label: 'Not equals' },
  { value: StepOperand.GT, label: 'Greater than' },
  { value: StepOperand.GTE, label: 'Greater than or equal' },
  { value: StepOperand.LT, label: 'Less than' },
  { value: StepOperand.LTE, label: 'Less than or equal' },
  { value: StepOperand.LIKE, label: 'Contains' },
  { value: StepOperand.ILIKE, label: 'Contains (case insensitive)' },
  { value: StepOperand.IN, label: 'In' },
  { value: StepOperand.IS, label: 'Is' },
];

export const WorkflowStepFilterOperandSelect = ({
  stepFilter,
}: WorkflowStepFilterOperandSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const handleChange = (operand: StepOperand) => {
    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        operand,
      },
    });
  };

  return (
    <Select
      fullWidth
      dropdownWidth={GenericDropdownContentWidth.Medium}
      dropdownId={`step-filter-operand-${stepFilter.id}`}
      value={stepFilter.operand}
      options={STEP_OPERAND_OPTIONS}
      onChange={handleChange}
      disabled={readonly}
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
    />
  );
};
