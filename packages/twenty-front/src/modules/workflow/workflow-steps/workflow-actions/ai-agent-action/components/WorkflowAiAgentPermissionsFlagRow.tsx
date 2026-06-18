import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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
  const isClickable = !readonly && !isEnabled && Boolean(onAdd);
  const isDisabled = isEnabled && !showDeleteButton;
  const showTrashButton = isEnabled && showDeleteButton;

  const iconButtons = showTrashButton
    ? [
        {
          Icon: IconTrash,
          onClick: (event: React.MouseEvent) => {
            event.stopPropagation();
            onDelete?.();
          },
        },
      ]
    : undefined;

  return (
    <MenuItem
      LeftIcon={permission.Icon}
      withIconContainer
      text={permission.name}
      onClick={isClickable ? onAdd : undefined}
      disabled={isDisabled}
      iconButtons={iconButtons}
    />
  );
};
