import { SelectControl } from '@/ui/input/components/SelectControl';
import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { StepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterContext';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type StepFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

export const StepFilterFieldSelect = ({
  stepFilter,
}: StepFilterFieldSelectProps) => {
  const { readonly, upsertStepFilter } = useContext(StepFilterContext);

  const { t } = useLingui();
  const { workflowVersionId } = useWorkflowStepContextOrThrow();

  const stepId = extractRawVariableNamePart({
    rawVariableName: stepFilter.stepOutputKey,
    part: 'stepId',
  });
  const stepsOutputSchema = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId,
      stepIds: [stepId],
    }),
  );

  if (!isDefined(stepId)) {
    return null;
  }

  const { variableLabel, variablePathLabel } =
    searchVariableThroughOutputSchema({
      stepOutputSchema: stepsOutputSchema?.[0],
      rawVariableName: stepFilter.stepOutputKey,
      isFullRecord: false,
    });

  const isVariableNotFound = !isDefined(variableLabel);
  const label = isVariableNotFound ? t`Not Found` : variableLabel;
  const title = isVariableNotFound ? t`Variable not found` : variablePathLabel;

  const handleChange = (variableName: string) => {
    upsertStepFilter?.({
      ...stepFilter,
      stepOutputKey: variableName,
      displayValue: label,
    });
  };

  return (
    <WorkflowVariablesDropdown
      inputId={`step-filter-field-${stepFilter.id}`}
      onVariableSelect={handleChange}
      disabled={readonly}
      clickableComponent={
        <SelectControl
          selectedOption={{
            value: stepFilter.stepOutputKey,
            label,
          }}
          isDisabled={readonly}
        />
      }
    />
  );
};
