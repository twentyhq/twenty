/* @license Enterprise */

import { useContext } from 'react';
import { styled } from '@linaria/react';
import { IconVariablePlus } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledRecordLevelPermissionPickerContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  display: flex;
  justify-content: center;

  ${({ readonly }) =>
    !readonly
      ? `
      :hover {
        background-color: ${themeCssVariables.background.transparent.light};
      }
    `
      : ''}

  ${({ multiline }) =>
    multiline
      ? `
          border-radius: ${themeCssVariables.border.radius.sm};
          padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[0]};
          position: absolute;
          right: ${themeCssVariables.spacing[0]};
          top: ${themeCssVariables.spacing[0]};
        `
      : `
          background-color: ${themeCssVariables.background.transparent.lighter};
          border-top-right-radius: ${themeCssVariables.border.radius.sm};
          border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
          border: 1px solid ${themeCssVariables.border.color.medium};
          cursor: pointer;
          padding: ${themeCssVariables.spacing[2]};
          color: ${themeCssVariables.font.color.tertiary};
        `}
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
