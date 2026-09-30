import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { WorkflowVariablesDropdownStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownStepItems';
import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';
import { type InputSchemaPropertyType } from 'twenty-shared/workflow';

import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableStepSelection } from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconVariablePlus } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledDropdownVariableButtonContainer = styled.div<{
  disabled?: boolean;
}>`
  align-items: center;
  background-color: transparent;
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  user-select: none;
`;

type WorkflowVariablesDropdownProps = {
  disabled?: boolean;
  fieldTypesToExclude?: InputSchemaPropertyType[];
  instanceId: string;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  objectNameSingularsToSelect?: string[];
};

export const WorkflowVariablesDropdown = ({
  disabled,
  fieldTypesToExclude,
  instanceId,
  onVariableSelect,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: WorkflowVariablesDropdownProps) => {
  const theme = useTheme();
  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${instanceId}`;
  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields,
    shouldDisplayRecordObjects,
    fieldTypesToExclude,
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
  const [hasRestoredFocus, setHasRestoredFocus] = useState(false);

  const handleStepSelect = ({
    stepId,
    path = [],
  }: WorkflowVariableStepSelection) => {
    setSelectedPath(path);
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = (subItem: string) => {
    onVariableSelect(subItem);
    const focusedElement = document.activeElement;
    const isFocusOutsideDropdown =
      isDefined(focusedElement) &&
      focusedElement !== document.body &&
      !isDefined(focusedElement.closest('[data-dropdown-content]'));

    setHasRestoredFocus(isFocusOutsideDropdown);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  if (disabled === true || noAvailableVariables) {
    return (
      <Tooltip
        content={t`No variables are available yet. Variables come from the workflow trigger and previous steps.`}
        side="top"
        delay={TooltipDelay.mediumDelay}
        sideOffset={5}
      >
        <StyledDropdownVariableButtonContainer
          disabled={true}
          data-variable-picker-disabled-anchor={dropdownId}
        >
          <IconVariablePlus
            size={theme.icon.size.md}
            color={theme.font.color.light}
          />
        </StyledDropdownVariableButtonContainer>
      </Tooltip>
    );
  }

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          setHasRestoredFocus(false);
          return;
        }

        setSelectedStep(initialStep);
        setSelectedPath([]);
      }}
    >
      <Dropdown.Trigger
        aria-label={t`Insert variable`}
        nativeButton={false}
        render={<StyledDropdownVariableButtonContainer />}
      >
        <IconVariablePlus size={theme.icon.size.md} />
      </Dropdown.Trigger>
      <DropdownContent
        align="end"
        sideOffset={4}
        width={GenericDropdownContentWidth.ExtraLarge}
        finalFocus={hasRestoredFocus ? false : undefined}
      >
        {!isDefined(selectedStep) ? (
          <WorkflowVariablesDropdownSteps
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
            onVariableSelect={({ rawVariableName }) =>
              handleSubItemSelect(rawVariableName)
            }
            shouldDisplayRecordObjects={shouldDisplayRecordObjects}
            objectNameSingularsToSelect={objectNameSingularsToSelect}
          />
        ) : (
          <WorkflowVariablesDropdownStepItems
            step={selectedStep}
            initialPath={selectedPath}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
            shouldDisplayRecordObjects={shouldDisplayRecordObjects}
            objectNameSingularsToSelect={objectNameSingularsToSelect}
          />
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
