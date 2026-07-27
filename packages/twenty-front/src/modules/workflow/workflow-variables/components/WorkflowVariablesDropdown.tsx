import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useDropdownTriggerAria } from '@/ui/layout/dropdown/hooks/useDropdownTriggerAria';
import { BUTTON_RESET_STYLE } from '@/ui/theme/constants/ButtonResetStyle';
import { WorkflowVariablesDropdownStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownStepItems';
import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';
import { type InputSchemaPropertyType } from 'twenty-shared/workflow';

import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconVariablePlus } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownVariableButtonContainer = styled.button<{
  isDisabled?: boolean;
}>`
  ${BUTTON_RESET_STYLE}
  align-items: center;
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  user-select: none;
`;

export const WorkflowVariablesDropdown = ({
  clickableComponent,
  disabled,
  fieldTypesToExclude,
  instanceId,
  onVariableSelect,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: {
  clickableComponent?: React.ReactNode;
  disabled?: boolean;
  fieldTypesToExclude?: InputSchemaPropertyType[];
  instanceId: string;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  objectNameSingularsToSelect?: string[];
}) => {
  const { theme } = useContext(ThemeContext);
  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${instanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const { dropdownOptionsId, isDropdownOpen } =
    useDropdownTriggerAria(dropdownId);
  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields,
    shouldDisplayRecordObjects,
    fieldTypesToExclude,
  });

  const noAvailableVariables = availableVariablesInWorkflowStep.length === 0;

  const initialStep =
    availableVariablesInWorkflowStep.length === 1
      ? availableVariablesInWorkflowStep[0]
      : undefined;

  const [selectedStep, setSelectedStep] = useState<
    StepOutputSchemaV2 | undefined
  >(initialStep);

  const handleStepSelect = (stepId: string) => {
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = (subItem: string) => {
    onVariableSelect(subItem);
    setSelectedStep(initialStep);
    closeDropdown(dropdownId);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  if (disabled === true || noAvailableVariables) {
    return (
      <>
        <StyledDropdownVariableButtonContainer
          type="button"
          isDisabled={true}
          aria-disabled={true}
          aria-label={t`Insert variable`}
          data-variable-picker-disabled-anchor={dropdownId}
        >
          <IconVariablePlus
            size={theme.icon.size.md}
            color={theme.font.color.light}
          />
        </StyledDropdownVariableButtonContainer>
        <AppTooltip
          anchorSelect={`[data-variable-picker-disabled-anchor="${dropdownId}"]`}
          content={t`No variables are available yet. Variables come from the workflow trigger and previous steps.`}
          place={TooltipPosition.Top}
          delay={TooltipDelay.mediumDelay}
          offset={5}
          noArrow
        />
      </>
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      isDropdownInModal={true}
      clickableComponent={
        clickableComponent ?? (
          <StyledDropdownVariableButtonContainer
            type="button"
            aria-label={t`Insert variable`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-controls={dropdownOptionsId}
          >
            <IconVariablePlus size={theme.icon.size.md} />
          </StyledDropdownVariableButtonContainer>
        )
      }
      dropdownComponents={
        !isDefined(selectedStep) ? (
          <WorkflowVariablesDropdownSteps
            dropdownId={dropdownId}
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
          />
        ) : (
          <WorkflowVariablesDropdownStepItems
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
            shouldDisplayRecordObjects={shouldDisplayRecordObjects}
            objectNameSingularsToSelect={objectNameSingularsToSelect}
          />
        )
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{
        y: parseInt(theme.spacing[1], 10),
      }}
    />
  );
};
