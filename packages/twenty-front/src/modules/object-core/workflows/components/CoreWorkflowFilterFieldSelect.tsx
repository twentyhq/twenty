import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_FILTER_FIELDS } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { Select } from '@/ui/input/components/Select';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';

type CoreWorkflowFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

export const CoreWorkflowFilterFieldSelect = ({
  stepFilter,
}: CoreWorkflowFilterFieldSelectProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const handleFieldChange = (fieldKey: string) => {
    const selectedField = findCoreWorkflowFilterField(fieldKey);

    if (!isDefined(selectedField)) {
      return;
    }

    const [defaultOperand] = getStepFilterOperands({
      filterType: selectedField.filterType,
      subFieldName: undefined,
    });

    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        stepOutputKey: selectedField.key,
        type: selectedField.filterType,
        operand: defaultOperand ?? ViewFilterOperand.IS,
        value: '',
      },
    });
  };

  return (
    <Select
      dropdownId={`core-workflow-filter-field-${stepFilter.id}`}
      options={CORE_WORKFLOW_FILTER_FIELDS.map((field) => ({
        value: field.key,
        label: t(field.label),
        Icon: field.Icon,
      }))}
      value={stepFilter.stepOutputKey}
      onChange={handleFieldChange}
      disabled={readonly}
      fullWidth
      dropdownWidthAuto
      emptyOption={{ value: '', label: t`Select a field` }}
    />
  );
};
