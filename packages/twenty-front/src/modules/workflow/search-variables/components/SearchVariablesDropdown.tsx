import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SearchVariablesDropdownFieldItems } from '@/workflow/search-variables/components/SearchVariablesDropdownFieldItems';
import { SearchVariablesDropdownObjectItems } from '@/workflow/search-variables/components/SearchVariablesDropdownObjectItems';
import { SearchVariablesDropdownWorkflowStepItems } from '@/workflow/search-variables/components/SearchVariablesDropdownWorkflowStepItems';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/search-variables/constants/SearchVariablesDropdownId';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/search-variables/hooks/useAvailableVariablesInWorkflowStep';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
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

export const SearchVariablesDropdown = ({
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
          <SearchVariablesDropdownWorkflowStepItems
            dropdownId={dropdownId}
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
          />
        ) : isDefined(objectNameSingularToSelect) ? (
          <SearchVariablesDropdownObjectItems
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
          />
        ) : (
          <SearchVariablesDropdownFieldItems
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
