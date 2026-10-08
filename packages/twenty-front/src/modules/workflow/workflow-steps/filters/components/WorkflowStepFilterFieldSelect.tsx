import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowDropdownStepOutputItems } from '@/workflow/workflow-steps/components/WorkflowDropdownStepOutputItems';
import { useUpdateStepFilterFromVariable } from '@/workflow/workflow-steps/filters/hooks/useUpdateStepFilterFromVariable';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { useSearchVariable } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import {
  type WorkflowVariableSelection,
  type WorkflowVariableStepSelection,
} from '@/workflow/workflow-variables/types/WorkflowVariableSelection';

import { InputHint } from '@/ui/input/components/internal/InputHint/InputHint';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  TRIGGER_STEP_ID,
  extractRawVariableNamePart,
  isStandaloneVariableString,
} from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/icon';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type WorkflowStepFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

const NON_SELECTABLE_FIELD_TYPES = [
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.RATING,
];

export const WorkflowStepFilterFieldSelect = ({
  stepFilter,
}: WorkflowStepFilterFieldSelectProps) => {
  const { readonly, stepId: currentStepId } = useContext(
    WorkflowStepFilterContext,
  );
  const { t } = useLingui();
  const { updateStepFilterFromVariable } = useUpdateStepFilterFromVariable({
    stepFilter,
  });
  const { getIcon } = useIcons();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields: true,
    shouldDisplayRecordObjects: true,
    fieldTypesToExclude: NON_SELECTABLE_FIELD_TYPES,
  });
  const noAvailableVariables = !isNonEmptyArray(
    availableVariablesInWorkflowStep,
  );

  const initialStep =
    availableVariablesInWorkflowStep.length === 1
      ? availableVariablesInWorkflowStep[0]
      : undefined;

  const [selectedStep, setSelectedStep] = useState<
    StepOutputSchemaV2 | undefined
  >(initialStep);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

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

  const handleStepSelect = ({
    stepId,
    path = [],
  }: WorkflowVariableStepSelection) => {
    setSelectedPath(path);
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  const handleVariableSelect = ({
    rawVariableName,
    stepId,
    isFullRecord,
  }: WorkflowVariableSelection) => {
    const step = availableVariablesInWorkflowStep.find(
      (item) => item.id === stepId,
    );

    if (!isDefined(step)) {
      return;
    }

    updateStepFilterFromVariable({
      rawVariableName,
      stepType: step.type,
      isFullRecord,
    });
  };

  const isSelectedFieldNotFound = !isDefined(variableLabel);

  const isStepOutputKeyBroken =
    isNonEmptyString(stepFilter.stepOutputKey) &&
    !isStandaloneVariableString(stepFilter.stepOutputKey);

  const label = isSelectedFieldNotFound
    ? currentStepId === TRIGGER_STEP_ID
      ? t`Select a field`
      : t`Select a field from a previous step`
    : variableLabel;

  const brokenFieldReferenceHint = isStepOutputKeyBroken ? (
    <InputHint danger>
      {t`Broken field reference. Select the field again to fix this condition.`}
    </InputHint>
  ) : null;

  const fullRecordIconProps = stepFilter.isFullRecord
    ? isDefined(filterObjectMetadataItem)
      ? getSelectIconPropsFromObjectMetadataItem(filterObjectMetadataItem)
      : undefined
    : undefined;

  const icon = stepFilter.isFullRecord
    ? fullRecordIconProps?.Icon
    : filterFieldMetadataItem?.icon
      ? getIcon(filterFieldMetadataItem.icon)
      : undefined;

  const iconThemeColor = fullRecordIconProps?.iconThemeColor;

  if (readonly || noAvailableVariables) {
    const disabledLabel = noAvailableVariables
      ? t`No available fields to select`
      : label;

    return (
      <>
        <SelectControl
          selectedOption={{
            value: stepFilter.stepOutputKey,
            label: disabledLabel,
            fullLabel: variablePathLabel,
            Icon: icon,
            iconThemeColor,
          }}
          isDisabled={true}
        />
        {brokenFieldReferenceHint}
      </>
    );
  }

  return (
    <>
      <DropdownRoot
        dropdownId={dropdownId}
        type="picker"
        onOpenChange={(open) => {
          if (!open) {
            return;
          }

          setSelectedStep(initialStep);
          setSelectedPath([]);
        }}
      >
        <Dropdown.Trigger nativeButton={false} render={<div />}>
          <SelectControl
            selectedOption={{
              label,
              fullLabel: variablePathLabel,
              value: stepFilter.stepOutputKey,
              Icon: icon,
              iconThemeColor,
            }}
            textAccent={isSelectedFieldNotFound ? 'placeholder' : 'default'}
          />
        </Dropdown.Trigger>
        <DropdownContent
          align="end"
          sideOffset={4}
          alignOffset={-2}
          width={GenericDropdownContentWidth.ExtraLarge}
        >
          {!isDefined(selectedStep) ? (
            <WorkflowVariablesDropdownSteps
              steps={availableVariablesInWorkflowStep}
              onSelect={handleStepSelect}
              onVariableSelect={handleVariableSelect}
              shouldDisplaySpecialItems={false}
              shouldDisplayRecordObjects
            />
          ) : (
            <WorkflowDropdownStepOutputItems
              stepFilter={stepFilter}
              step={selectedStep}
              initialPath={selectedPath}
              onBack={handleBack}
            />
          )}
        </DropdownContent>
      </DropdownRoot>
      {brokenFieldReferenceHint}
    </>
  );
};
