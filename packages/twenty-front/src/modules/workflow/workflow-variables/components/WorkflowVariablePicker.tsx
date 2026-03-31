import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSearchVariablesDropdownContainer = styled.div<{
  isReadonly?: boolean;
  isUnfolded?: boolean;
  multiline?: boolean;
}>`
  align-items: center;
  background-color: ${({ isUnfolded, multiline }) =>
    isUnfolded
      ? themeCssVariables.background.transparent.light
      : multiline
        ? 'transparent'
        : themeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};

  border-radius: ${({ multiline }) =>
    multiline
      ? themeCssVariables.border.radius.sm
      : `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`};

  display: flex;
  height: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  justify-content: center;
  margin: ${({ multiline }) =>
    multiline ? `${themeCssVariables.spacing[1]}` : '0'};

  position: ${({ multiline }) => (multiline ? 'absolute' : 'static')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  width: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  &:hover {
    background-color: ${({ isReadonly, isUnfolded, multiline }) => {
      if (isReadonly === true) {
        return multiline
          ? 'transparent'
          : themeCssVariables.background.transparent.lighter;
      }
      return isUnfolded
        ? themeCssVariables.background.transparent.medium
        : themeCssVariables.background.transparent.light;
    }};
  }
`;

export const WorkflowVariablePicker: VariablePickerComponent = ({
  instanceId,
  disabled,
  multiline,
  onVariableSelect,
  shouldDisplayRecordObjects = false,
  shouldDisplayRecordFields = true,
}) => {
  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${instanceId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  return (
    <StyledSearchVariablesDropdownContainer
      isReadonly={disabled}
      isUnfolded={isDropdownOpen}
      multiline={multiline}
    >
      <WorkflowVariablesDropdown
        instanceId={instanceId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
        shouldDisplayRecordObjects={shouldDisplayRecordObjects}
        shouldDisplayRecordFields={shouldDisplayRecordFields}
      />
    </StyledSearchVariablesDropdownContainer>
  );
};
