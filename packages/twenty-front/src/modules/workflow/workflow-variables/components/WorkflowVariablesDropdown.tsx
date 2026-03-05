import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type InputSchemaPropertyType } from 'twenty-shared/workflow';
import { WorkflowVariablesDropdownStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownStepItems';
import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';

import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconVariablePlus } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
const StyledDropdownVariableButtonWrapper = styled.div<{
  transparentBackground?: boolean;
  disabled?: boolean;
}>`
  > div {
    background-color: ${({ transparentBackground }) =>
      transparentBackground
        ? 'transparent'
        : themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.tertiary};
    padding: ${themeCssVariables.spacing[2]};

    :hover {
      cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }
  }
`;

export const WorkflowVariablesDropdown = ({
  instanceId,
  onVariableSelect,
  disabled,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  fieldTypesToExclude,
  multiline,
  clickableComponent,
}: {
  instanceId: string;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  fieldTypesToExclude?: InputSchemaPropertyType[];
  disabled?: boolean;
  multiline?: boolean;
  clickableComponent?: React.ReactNode;
}) => {
  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${instanceId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();
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
      <StyledDropdownVariableButtonWrapper
        disabled={true}
        transparentBackground
      >
        <StyledDropdownButtonContainer
          isUnfolded={isDropdownOpen}
          transparentBackground
        >
          <IconVariablePlus
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
            color={resolveThemeVariable(themeCssVariables.font.color.light)}
          />
        </StyledDropdownButtonContainer>
      </StyledDropdownVariableButtonWrapper>
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      isDropdownInModal={true}
      clickableComponent={
        clickableComponent ?? (
          <StyledDropdownVariableButtonWrapper transparentBackground>
            <StyledDropdownButtonContainer
              isUnfolded={isDropdownOpen}
              transparentBackground
            >
              <IconVariablePlus
                size={resolveThemeVariableAsNumber(
                  themeCssVariables.icon.size.sm,
                )}
              />
            </StyledDropdownButtonContainer>
          </StyledDropdownVariableButtonWrapper>
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
          />
        )
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{
        x: 2,
        y: parseInt(
          resolveThemeVariable(themeCssVariables.spacing[multiline ? 11 : 1]),
          10,
        ),
      }}
    />
  );
};
