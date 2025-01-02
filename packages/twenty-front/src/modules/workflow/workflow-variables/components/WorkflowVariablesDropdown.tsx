import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { WorkflowVariablesDropdownFieldItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownFieldItems';
import { WorkflowVariablesDropdownObjectItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownObjectItems';
import { WorkflowVariablesDropdownWorkflowStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownWorkflowStepItems';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';

import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconVariablePlus, isDefined } from 'twenty-ui';

const StyledDropdownVariableButtonContainer = styled(
  StyledDropdownButtonContainer,
)<{ transparentBackground?: boolean; disabled?: boolean }>`
  background-color: ${({ theme, transparentBackground }) =>
    transparentBackground
      ? 'transparent'
      : theme.background.transparent.lighter};

  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  :hover {
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
`;

export const WorkflowVariablesDropdown = ({
  inputId,
  onVariableSelect,
  disabled,
  objectNameSingularToSelect,
}: {
  inputId: string;
  onVariableSelect: (variableName: string) => void;
  disabled?: boolean;
  objectNameSingularToSelect?: string;
}) => {
  const theme = useTheme();

  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${inputId}`;
  const { isDropdownOpen, closeDropdown } = useDropdown(dropdownId);
  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    objectNameSingularToSelect,
  });

  const initialStep =
    availableVariablesInWorkflowStep.length === 1
      ? availableVariablesInWorkflowStep[0]
      : undefined;

  const [selectedStep, setSelectedStep] = useState<
    StepOutputSchema | undefined
  >(initialStep);

  const handleStepSelect = (stepId: string) => {
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = (subItem: string) => {
    onVariableSelect(subItem);
    setSelectedStep(undefined);
    closeDropdown();
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  if (disabled === true) {
    return (
      <StyledDropdownVariableButtonContainer
        isUnfolded={isDropdownOpen}
        disabled={disabled}
        transparentBackground
      >
        <IconVariablePlus
          size={theme.icon.size.sm}
          color={theme.font.color.light}
        />
      </StyledDropdownVariableButtonContainer>
    );
  }

  return (
    <Dropdown
      dropdownMenuWidth={320}
      dropdownId={dropdownId}
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
      clickableComponent={
        <StyledDropdownVariableButtonContainer
          isUnfolded={isDropdownOpen}
          disabled={disabled}
          transparentBackground
        >
          <IconVariablePlus size={theme.icon.size.sm} />
        </StyledDropdownVariableButtonContainer>
      }
      dropdownComponents={
        !isDefined(selectedStep) ? (
          <WorkflowVariablesDropdownWorkflowStepItems
            dropdownId={dropdownId}
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
          />
        ) : isDefined(objectNameSingularToSelect) ? (
          <WorkflowVariablesDropdownObjectItems
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
          />
        ) : (
          <WorkflowVariablesDropdownFieldItems
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
          />
        )
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 2, y: 4 }}
    />
  );
};
