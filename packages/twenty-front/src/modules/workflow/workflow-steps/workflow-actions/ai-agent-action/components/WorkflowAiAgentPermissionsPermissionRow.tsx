import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowAiAgentPermissionsPermissionRowProps = {
  permission: {
    key: SettingsRoleObjectPermissionKey;
    label: string;
  };
  isEnabled: boolean;
  readonly: boolean;
  showDeleteButton?: boolean;
  alwaysShowGranted?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
};

export const WorkflowAiAgentPermissionsPermissionRow = ({
  permission,
  isEnabled,
  readonly,
  showDeleteButton = true,
  alwaysShowGranted = false,
  onAdd,
  onDelete,
}: WorkflowAiAgentPermissionsPermissionRowProps) => {
  const isClickable = !readonly && !isEnabled;
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
      LeftComponent={
        <PermissionIcon
          permission={permission.key}
          state={alwaysShowGranted || isEnabled ? 'granted' : 'revoked'}
        />
      }
      text={permission.label}
      onClick={isClickable ? onAdd : undefined}
      disabled={isDisabled}
      iconButtons={iconButtons}
    />
  );
};
