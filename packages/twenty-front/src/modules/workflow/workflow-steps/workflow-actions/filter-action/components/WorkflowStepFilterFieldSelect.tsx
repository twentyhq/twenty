import { SelectControl } from '@/ui/input/components/SelectControl';
import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowStepFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

export const WorkflowStepFilterFieldSelect = ({
  stepFilter,
}: WorkflowStepFilterFieldSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

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

  const { variableLabel } = searchVariableThroughOutputSchema({
    stepOutputSchema: stepsOutputSchema?.[0],
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord: false,
  });

  const isSelectedFieldNotFound = !isDefined(variableLabel);
  const label = isSelectedFieldNotFound ? t`No Field Selected` : variableLabel;

  const handleChange = (variableName: string) => {
    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        stepOutputKey: variableName,
        displayValue: label,
      },
    });
  };

  return (
    <WorkflowVariablesDropdown
      instanceId={`step-filter-field-${stepFilter.id}`}
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
