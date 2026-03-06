/* @license Enterprise */

import { styled } from '@linaria/react';
import { IconVariablePlus } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledRecordLevelPermissionPickerContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};

  border-bottom-right-radius: ${({ multiline }) =>
    multiline ? '0' : themeCssVariables.border.radius.sm};
  border-radius: ${({ multiline }) =>
    multiline ? themeCssVariables.border.radius.sm : '0'};
  border-top-right-radius: ${({ multiline }) =>
    multiline ? '0' : themeCssVariables.border.radius.sm};
  color: ${({ multiline }) =>
    multiline
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: ${({ multiline }) => (multiline ? 'default' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${({ multiline }) =>
    multiline
      ? `${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[0]}`
      : themeCssVariables.spacing[2]};
  position: ${({ multiline }) => (multiline ? 'absolute' : 'relative')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};

  &:hover {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : themeCssVariables.background.transparent.light};
  }
`;

export const createRecordLevelPermissionVariablePicker = (
  recordFilterId: string,
  onMeSelect: (
    workspaceMemberFieldMetadataId: string,
    workspaceMemberSubFieldName?: string | null,
  ) => void,
): VariablePickerComponent => {
  const RecordLevelPermissionVariablePicker: VariablePickerComponent = ({
    instanceId,
    disabled,
    multiline,
  }) => {
    const { theme } = useContext(ThemeContext);

    return (
      <Dropdown
        dropdownId={`record-level-permission-me-picker-${instanceId}-${recordFilterId}`}
        clickableComponent={
          <StyledRecordLevelPermissionPickerContainer
            multiline={multiline}
            readonly={disabled}
          >
            <IconVariablePlus size={theme.icon.size.sm} />
          </StyledRecordLevelPermissionPickerContainer>
        }
        dropdownComponents={
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect
            onSelect={onMeSelect}
            recordFilterId={recordFilterId}
          />
        }
        dropdownPlacement="bottom-end"
      />
    );
  };

  return RecordLevelPermissionVariablePicker;
};
