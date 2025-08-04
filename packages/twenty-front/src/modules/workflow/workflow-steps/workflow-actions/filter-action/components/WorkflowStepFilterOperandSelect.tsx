import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { getViewFilterOperands } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getStepFilterOperands';
import { useContext } from 'react';
import { StepFilter, ViewFilterOperand } from 'twenty-shared/src/types';

type WorkflowStepFilterOperandSelectProps = {
  stepFilter: StepFilter;
};

export const WorkflowStepFilterOperandSelect = ({
  stepFilter,
}: WorkflowStepFilterOperandSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const operands = getViewFilterOperands({
    filterType: stepFilter.type,
    subFieldName: stepFilter.compositeFieldSubFieldName,
  });

  const options = operands.map((operand) => ({
    value: operand,
    label: getOperandLabel(operand),
  }));

  const handleChange = (operand: ViewFilterOperand) => {
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
      options={options}
      onChange={handleChange}
      disabled={readonly}
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
    />
  );
};
