import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { getViewFilterOperands } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getStepFilterOperands';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
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
  const shouldDisplayRecordFields = true;
  const shouldDisplayRecordObjects = true;

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

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields,
    shouldDisplayRecordObjects,
  });

  const noAvailableVariables = availableVariablesInWorkflowStep.length === 0;

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

        const {
          variableLabel,
          variableType,
          fieldMetadataId,
          compositeFieldSubFieldName,
        } = searchVariableThroughOutputSchema({
          stepOutputSchema: currentStepOutputSchema?.[0],
          rawVariableName: variableName,
          isFullRecord: false,
        });

        const filterType = isDefined(fieldMetadataId)
          ? getFieldMetadataItemById(fieldMetadataId).type
          : variableType;

        upsertStepFilterSettings({
          stepFilterToUpsert: {
            ...stepFilter,
            stepOutputKey: variableName,
            displayValue: variableLabel ?? '',
            type: filterType ?? 'unknown',
            value: '',
            fieldMetadataId,
            compositeFieldSubFieldName,
            operand: getViewFilterOperands({
              filterType,
              subFieldName: compositeFieldSubFieldName,
            })?.[0],
          },
        });
      },
    [
      upsertStepFilterSettings,
      stepFilter,
      workflowVersionId,
      getFieldMetadataItemById,
    ],
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
  const label = isSelectedFieldNotFound
    ? t`Select a field from a previous step`
    : variableLabel;
  const dropdownId = `step-filter-field-${stepFilter.id}`;

  const isReadonly = readonly ?? false;

  if (isReadonly || noAvailableVariables) {
    return (
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              value: stepFilter.stepOutputKey,
              label: isReadonly
                ? (variableLabel ?? '')
                : t`No available fields to select`,
            }}
            isDisabled={true}
          />
        }
        dropdownComponents={[]}
      />
    );
  }

  return (
    <WorkflowVariablesDropdown
      instanceId={dropdownId}
      onVariableSelect={handleChange}
      disabled={readonly}
      clickableComponent={
        <SelectControl
          selectedOption={{
            value: stepFilter.stepOutputKey,
            label,
          }}
          textAccent={isSelectedFieldNotFound ? 'placeholder' : 'default'}
        />
      }
      shouldDisplayRecordFields={shouldDisplayRecordFields}
      shouldDisplayRecordObjects={shouldDisplayRecordObjects}
      shouldEnableSelectRelationObject={true}
    />
  );
};
