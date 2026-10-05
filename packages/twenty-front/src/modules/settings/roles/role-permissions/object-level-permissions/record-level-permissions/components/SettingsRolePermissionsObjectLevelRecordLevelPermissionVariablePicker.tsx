/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconVariablePlus } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect';
import { RecordLevelPermissionVariablePickerContext } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/contexts/RecordLevelPermissionVariablePickerContext';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

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

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionVariablePicker: VariablePickerComponent =
  ({ instanceId, disabled, multiline }) => {
    const theme = useTheme();
    const pickerContext = useContext(
      RecordLevelPermissionVariablePickerContext,
    );

    if (!isDefined(pickerContext)) {
      return null;
    }

    const { recordFilterId, onSelect } = pickerContext;

    return (
      <DropdownRoot
        dropdownId={`record-level-permission-me-picker-${instanceId}-${recordFilterId}`}
        type="picker"
      >
        <Dropdown.Trigger
          render={
            <StyledRecordLevelPermissionPickerContainer
              multiline={multiline}
              readonly={disabled}
            />
          }
          nativeButton={false}
          disabled={disabled}
          aria-label={t`Select a current user field`}
        >
          <IconVariablePlus size={theme.icon.size.sm} />
        </Dropdown.Trigger>
        <DropdownContent
          side="bottom"
          align="end"
          width={GenericDropdownContentWidth.Medium}
        >
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect
            onSelect={onSelect}
            recordFilterId={recordFilterId}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  };
