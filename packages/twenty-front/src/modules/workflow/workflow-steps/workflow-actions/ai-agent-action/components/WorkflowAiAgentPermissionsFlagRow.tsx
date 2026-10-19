import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useTheme } from 'twenty-ui/theme';
import { IconTrash } from 'twenty-ui/icon';

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
    <ListItemIconContainer>
      <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    </ListItemIconContainer>
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
