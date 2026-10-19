import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { IconTrash } from 'twenty-ui/icon';

const StyledIconContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};
`;

type WorkflowAiAgentPermissionsFlagRowProps = {
  permission: SettingsRolePermissionsSettingPermission;
  isEnabled: boolean;
  readonly: boolean;
  showDeleteButton?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
};

export const WorkflowAiAgentPermissionsFlagRow = ({
  permission,
  isEnabled,
  readonly,
  showDeleteButton = false,
  onAdd,
  onDelete,
}: WorkflowAiAgentPermissionsFlagRowProps) => {
  const theme = useTheme();
  const isClickable = !readonly && !isEnabled && isDefined(onAdd);
  const isDisabled = isEnabled && !showDeleteButton;
  const showTrashButton = isEnabled && showDeleteButton;

  const Icon = permission.Icon;
  const startIcon = (
    <StyledIconContainer>
      <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    </StyledIconContainer>
  );

  if (isClickable) {
    return (
      <ListItemButton startIcon={startIcon} onClick={onAdd}>
        {permission.name}
      </ListItemButton>
    );
  }

  return (
    <ListItem
      startIcon={startIcon}
      disabled={isDisabled}
      actions={
        showTrashButton && (
          <LightIconButton aria-label={t`Remove permission`} onClick={onDelete}>
            <IconTrash />
          </LightIconButton>
        )
      }
    >
      {permission.name}
    </ListItem>
  );
};
