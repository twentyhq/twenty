/* @license Enterprise */

import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconVariablePlus } from 'twenty-ui/display';

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

  ${({ theme, readonly }) =>
    !readonly &&
    css`
      :hover {
        background-color: ${theme.background.transparent.light};
      }
    `}

  ${({ theme, multiline }) =>
    multiline
      ? css`
          border-radius: ${theme.border.radius.sm};
          padding: ${theme.spacing(0.5)} ${theme.spacing(0)};
          position: absolute;
          right: ${theme.spacing(0)};
          top: ${theme.spacing(0)};
        `
      : css`
          background-color: ${theme.background.transparent.lighter};
          border-top-right-radius: ${theme.border.radius.sm};
          border-bottom-right-radius: ${theme.border.radius.sm};
          border: 1px solid ${theme.border.color.medium};
          cursor: pointer;
          padding: ${theme.spacing(2)};
          color: ${theme.font.color.tertiary};
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
    const theme = useTheme();

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
