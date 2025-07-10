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
import { useRecoilCallback, useRecoilValue } from 'recoil';
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

  const handleChange = useRecoilCallback(
    ({ snapshot }) =>
      (variableName: string) => {
        const stepId = extractRawVariableNamePart({
          rawVariableName: variableName,
          part: 'stepId',
        });
        const currentStepOutputSchema = snapshot
          .getLoadable(
            stepsOutputSchemaFamilySelector({
              workflowVersionId,
              stepIds: [stepId],
            }),
          )
          .getValue();

        const { variableLabel, variableType } =
          searchVariableThroughOutputSchema({
            stepOutputSchema: currentStepOutputSchema?.[0],
            rawVariableName: variableName,
            isFullRecord: false,
          });

        upsertStepFilterSettings({
          stepFilterToUpsert: {
            ...stepFilter,
            stepOutputKey: variableName,
            displayValue: variableLabel ?? '',
            type: variableType ?? 'unknown',
          },
        });
      },
    [upsertStepFilterSettings, stepFilter, workflowVersionId],
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
