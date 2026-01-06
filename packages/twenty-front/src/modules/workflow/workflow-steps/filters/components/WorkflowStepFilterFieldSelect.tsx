import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { WorkflowDropdownStepOutputItems } from '@/workflow/workflow-steps/components/WorkflowDropdownStepOutputItems';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { useSearchVariable } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type WorkflowStepFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

const NON_SELECTABLE_FIELD_TYPES = [
  FieldMetadataType.RICH_TEXT_V2,
  FieldMetadataType.RATING,
];

export const WorkflowStepFilterFieldSelect = ({
  stepFilter,
}: WorkflowStepFilterFieldSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { t } = useLingui();
  const theme = useTheme();
  const { closeDropdown } = useCloseDropdown();
  const { getIcon } = useIcons();

  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields: true,
    shouldDisplayRecordObjects: true,
    fieldTypesToExclude: NON_SELECTABLE_FIELD_TYPES,
  });
  const noAvailableVariables = availableVariablesInWorkflowStep.length === 0;

  const initialStep =
    availableVariablesInWorkflowStep.length === 1
      ? availableVariablesInWorkflowStep[0]
      : undefined;

  const [selectedStep, setSelectedStep] = useState<
    StepOutputSchemaV2 | undefined
  >(initialStep);

  const stepId = extractRawVariableNamePart({
    rawVariableName: stepFilter.stepOutputKey,
    part: 'stepId',
  });

  const { variableLabel, variablePathLabel } = useSearchVariable({
    stepId,
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord: stepFilter.isFullRecord ?? false,
  });

  const {
    fieldMetadataItem: filterFieldMetadataItem,
    objectMetadataItem: filterObjectMetadataItem,
  } = useFieldMetadataItemById(stepFilter.fieldMetadataId ?? '');

  const dropdownId = `step-filter-field-${stepFilter.id}`;

  const handleStepSelect = (stepId: string) => {
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = () => {
    setSelectedStep(initialStep);
    closeDropdown(dropdownId);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  const isSelectedFieldNotFound = !isDefined(variableLabel);
  const label = isSelectedFieldNotFound
    ? t`Select a field from a previous step`
    : variableLabel;

  const icon = stepFilter.isFullRecord
    ? getIcon(filterObjectMetadataItem?.icon)
    : filterFieldMetadataItem?.icon
      ? getIcon(filterFieldMetadataItem.icon)
      : undefined;

  if (readonly || noAvailableVariables) {
    const disabledLabel = noAvailableVariables
      ? t`No available fields to select`
      : label;

    return (
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              value: stepFilter.stepOutputKey,
              label: disabledLabel,
              fullLabel: variablePathLabel,
              Icon: icon,
            }}
            isDisabled={true}
          />
        }
        dropdownComponents={[]}
      />
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label,
            fullLabel: variablePathLabel,
            value: stepFilter.stepOutputKey,
            Icon: icon,
          }}
          textAccent={isSelectedFieldNotFound ? 'placeholder' : 'default'}
          isDisabled={readonly}
        />
      }
      dropdownComponents={
        !isDefined(selectedStep) ? (
          <WorkflowVariablesDropdownSteps
            dropdownId={dropdownId}
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
          />
        ) : (
          <WorkflowDropdownStepOutputItems
            stepFilter={stepFilter}
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
          />
        )
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{
        x: parseInt(theme.spacing(0.5), 10),
        y: parseInt(theme.spacing(1), 10),
      }}
    />
  );
};
