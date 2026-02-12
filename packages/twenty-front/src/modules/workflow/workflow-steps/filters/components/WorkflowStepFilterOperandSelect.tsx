import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WORKFLOW_TIMEZONE } from '@/workflow/constants/WorkflowTimeZone';

import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import { useContext } from 'react';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';
import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';

type WorkflowStepFilterOperandSelectProps = {
  stepFilter: StepFilter;
};

export const WorkflowStepFilterOperandSelect = ({
  stepFilter,
}: WorkflowStepFilterOperandSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const operands = getStepFilterOperands({
    filterType: stepFilter.type,
    subFieldName: stepFilter.compositeFieldSubFieldName,
  });

  const options = operands.map((operand) => ({
    value: operand,
    label: getOperandLabel(operand, WORKFLOW_TIMEZONE),
  }));

  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const handleChange = (operand: ViewFilterOperand) => {
    if (operand === ViewFilterOperand.IS_RELATIVE) {
      const newRelativeDateFilter = getRelativeDateFilterWithUserTimezone(
        DEFAULT_RELATIVE_DATE_FILTER_VALUE,
      );

      upsertStepFilterSettings({
        stepFilterToUpsert: {
          ...stepFilter,
          operand,
          value: JSON.stringify(newRelativeDateFilter),
        },
      });
      return;
    }

    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        operand,
        value: '',
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
