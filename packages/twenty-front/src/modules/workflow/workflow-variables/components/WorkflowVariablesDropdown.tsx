import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowVariablesDropdownAllItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownAllItems';
import { WorkflowVariablesDropdownFieldItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownFieldItems';
import { WorkflowVariablesDropdownWorkflowStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownWorkflowStepItems';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';

import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconVariablePlus } from 'twenty-ui/display';

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
  instanceId,
  onVariableSelect,
  disabled,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  shouldEnableSelectRelationObject,
  multiline,
  clickableComponent,
}: {
  instanceId: string;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  shouldEnableSelectRelationObject?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  clickableComponent?: React.ReactNode;
}) => {
  const theme = useTheme();

  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${instanceId}`;
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();
  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields,
    shouldDisplayRecordObjects,
  });

  const noAvailableVariables = availableVariablesInWorkflowStep.length === 0;

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
    setSelectedStep(initialStep);
    closeDropdown(dropdownId);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  if (disabled === true || noAvailableVariables) {
    return (
      <StyledDropdownVariableButtonContainer
        isUnfolded={isDropdownOpen}
        disabled={true}
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
      dropdownId={dropdownId}
      clickableComponent={
        clickableComponent ?? (
          <StyledDropdownVariableButtonContainer
            isUnfolded={isDropdownOpen}
            transparentBackground
          >
            <IconVariablePlus size={theme.icon.size.sm} />
          </StyledDropdownVariableButtonContainer>
        )
      }
      dropdownComponents={
        !isDefined(selectedStep) ? (
          <WorkflowVariablesDropdownWorkflowStepItems
            dropdownId={dropdownId}
            steps={availableVariablesInWorkflowStep}
            onSelect={handleStepSelect}
          />
        ) : shouldDisplayRecordObjects ? (
          <WorkflowVariablesDropdownAllItems
            step={selectedStep}
            onSelect={handleSubItemSelect}
            onBack={handleBack}
            shouldEnableSelectRelationObject={shouldEnableSelectRelationObject}
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
      dropdownOffset={{
        x: parseInt(theme.spacing(0.5), 10),
        y: parseInt(theme.spacing(multiline ? 11 : 1), 10),
      }}
    />
  );
};
